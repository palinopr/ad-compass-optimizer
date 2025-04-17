
/**
 * StrictSequentialQueue - Ensures truly sequential processing with no possibility of overlap
 */

import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { insightsQueueState, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

interface QueueItem<T = any> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  startTime?: number;
}

export class StrictSequentialQueue {
  private static instance: StrictSequentialQueue;
  private isProcessing = false;
  private activeRequest: Promise<any> | null = null;
  private requestQueue: QueueItem[] = [];
  private processingCount = 0;
  private lastRequestTime = 0;
  private processingLock = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.reset());
    }
    
    // For debugging
    if (typeof window !== 'undefined') {
      // @ts-ignore - Just for debugging
      window.strictSequentialQueue = this;
    }
    
    console.log('🔒 [STRICT QUEUE] Singleton instance created');
  }

  public static getInstance(): StrictSequentialQueue {
    if (!StrictSequentialQueue.instance) {
      StrictSequentialQueue.instance = new StrictSequentialQueue();
    }
    return StrictSequentialQueue.instance;
  }

  public async enqueueRequest<T>(
    request: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Global throttling check
    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn('⛔ [STRICT QUEUE] Global throttling active - rejecting new request', requestId);
      return Promise.reject(new Error('Global throttling active'));
    }

    // Queue lock check
    if (insightsQueueState.isActiveLock()) {
      console.warn('⛔ [STRICT QUEUE] Queue is locked - rejecting new request', requestId);
      return Promise.reject(new Error('Queue is locked'));
    }

    console.log(`📝 [STRICT QUEUE] Enqueueing request: ${requestId} (queue size: ${this.requestQueue.length})`);
    
    return new Promise<T>((resolve, reject) => {
      // Create queue item with this specific request's resolve/reject
      const queueItem: QueueItem<T> = {
        id: requestId,
        request,
        resolve,
        reject,
        startTime: Date.now()
      };

      // Add to queue
      this.requestQueue.push(queueItem);
      
      // Start processing the queue if it's not already being processed
      this.attemptProcessQueue();
    });
  }

  /**
   * Try to process the queue if not already processing
   * This is protected by multiple locks to ensure only one thread runs at a time
   */
  private attemptProcessQueue(): void {
    // If already trying to start processing or queue is empty, don't start again
    if (this.processingLock || this.requestQueue.length === 0) {
      return;
    }
    
    // Set processing lock to prevent multiple calls to processQueue
    this.processingLock = true;
    
    try {
      // If already processing, just log and return
      if (this.isProcessing) {
        console.log(`⏱️ [STRICT QUEUE] Queue is already being processed (${this.requestQueue.length} items waiting)`);
        return;
      }
      
      // Start processing the queue
      this.processQueue();
    } finally {
      // Release the lock
      this.processingLock = false;
    }
  }

  /**
   * Process the queue sequentially with enforced delays
   * CRITICAL: This never runs in parallel due to guard conditions
   */
  private async processQueue(): Promise<void> {
    // Double-check not already processing
    if (this.isProcessing) {
      console.warn('⚠️ [STRICT QUEUE] Attempted to process queue while already processing!');
      return;
    }

    this.isProcessing = true;
    const queueStartTime = Date.now();
    
    console.log(`🚀 [STRICT QUEUE] Starting to process queue with ${this.requestQueue.length} items`);
    insightsQueueState.lock();

    try {
      // Process all queue items sequentially
      while (this.requestQueue.length > 0) {
        // Enforce minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
          const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          console.log(`⏳ [STRICT QUEUE] Waiting ${waitTime}ms before next request`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Get next request (but don't remove from queue yet)
        const item = this.requestQueue[0];
        if (!item) break;
        
        this.lastRequestTime = Date.now();
        console.log(`🔄 [STRICT QUEUE] Processing request ${item.id}`);
        
        this.processingCount++;
        try {
          // Execute the request
          const result = await item.request();
          // Only remove from queue after successful completion
          this.requestQueue.shift();
          // Resolve the original promise
          item.resolve(result);
        } catch (error) {
          // On error, remove from queue but reject the promise
          this.requestQueue.shift();
          console.error(`❌ [STRICT QUEUE] Request ${item.id} failed:`, error);
          item.reject(error);
        } finally {
          this.processingCount--;
        }
        
        // Additional enforced delay after processing
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const totalProcessingTime = Date.now() - queueStartTime;
      console.log(`✅ [STRICT QUEUE] Queue processing complete in ${totalProcessingTime}ms`);
    } catch (error) {
      console.error('❌ [STRICT QUEUE] Fatal error processing queue:', error);
    } finally {
      this.isProcessing = false;
      this.lastRequestTime = 0;
      insightsQueueState.unlock();
      
      // Log processing duration
      const duration = Date.now() - queueStartTime;
      console.log(`⏱️ [STRICT QUEUE] Queue processing took ${duration}ms`);
    }
  }

  /**
   * Check if the queue is currently processing
   */
  public isActive(): boolean {
    return this.isProcessing || this.processingCount > 0 || this.requestQueue.length > 0;
  }

  /**
   * Get current queue stats
   */
  public getStats() {
    return {
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessing,
      activeRequests: this.processingCount,
    };
  }

  /**
   * Clear the queue and reset state
   */
  public reset(): void {
    // Reject any pending requests
    for (const item of this.requestQueue) {
      item.reject(new Error('Queue was reset'));
    }
    
    this.requestQueue = [];
    this.isProcessing = false;
    this.processingLock = false;
    this.lastRequestTime = 0;
    this.activeRequest = null;
    this.processingCount = 0;
    console.log('🧹 [STRICT QUEUE] Queue cleared');
  }
}

// Export the singleton instance
export const strictSequentialQueue = StrictSequentialQueue.getInstance();
