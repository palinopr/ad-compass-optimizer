
/**
 * StrictQueueManager - Enhanced singleton queue with improved locking and sequential processing
 * Designed to ensure only ONE request is processed at a time, with no possibility of concurrent execution
 */

import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { insightsQueueState, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class StrictQueueManager {
  private static instance: StrictQueueManager;
  
  // Queue state tracking
  private isProcessing = false;
  private processingLock = false;
  private requestQueue: Array<() => Promise<any>> = [];
  private lastRequestTime = 0;
  private activeRequest: null | Promise<any> = null;
  private processingCount = 0;
  
  // Stats for monitoring
  private totalProcessed = 0;
  private totalErrors = 0;
  private queueStartTime = 0;

  private constructor() {
    // Private constructor to enforce singleton pattern
    console.log('🔒 [STRICT QUEUE] Singleton instance created');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StrictQueueManager {
    if (!StrictQueueManager.instance) {
      StrictQueueManager.instance = new StrictQueueManager();
      
      // Register cleanup on page unload
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          console.log('🧹 [STRICT QUEUE] Cleaning up queue on page unload');
          StrictQueueManager.instance.clearQueue();
        });
      }
    }
    return StrictQueueManager.instance;
  }

  /**
   * Enqueue a request with a guaranteed lock
   * This is the main method that should be called from components
   */
  public enqueueRequest<T>(request: () => Promise<T>, requestId: string = 'unknown'): Promise<T> {
    // Check global blocking state before even queueing
    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn('⛔ [STRICT QUEUE] Global throttling active - rejecting new request', requestId);
      return Promise.reject(new Error('Global throttling active'));
    }
    
    // Check if queue is locked
    if (insightsQueueState.isActiveLock()) {
      console.warn('⛔ [STRICT QUEUE] Queue is locked - rejecting new request', requestId);
      return Promise.reject(new Error('Queue is locked'));
    }

    console.log(`📝 [STRICT QUEUE] Enqueueing request: ${requestId} (queue size: ${this.requestQueue.length})`);
    
    return new Promise<T>((resolve, reject) => {
      // Wrap the original request
      const wrappedRequest = async (): Promise<void> => {
        try {
          console.log(`⏳ [STRICT QUEUE] Starting execution of request: ${requestId}`);
          this.processingCount++;
          
          // Here is the core processing - execute the original request
          const result = await request();
          
          // If successful, resolve the promise
          resolve(result);
          this.totalProcessed++;
          
          console.log(`✅ [STRICT QUEUE] Request completed successfully: ${requestId}`);
        } catch (error) {
          console.error(`❌ [STRICT QUEUE] Request failed: ${requestId}`, error);
          this.totalErrors++;
          reject(error);
        } finally {
          this.processingCount--;
        }
      };

      // Add to queue and process if not already processing
      this.requestQueue.push(wrappedRequest);
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
    // Early return if already processing to prevent multiple queue processors
    if (this.isProcessing) {
      console.warn('⚠️ [STRICT QUEUE] Attempted to process queue while already processing!');
      return;
    }

    this.isProcessing = true;
    this.queueStartTime = Date.now();
    
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

        const request = this.requestQueue.shift();
        if (!request) continue;
        
        this.lastRequestTime = Date.now();
        
        // CRITICAL: Set active request and await it to completion 
        // This ensures we're only processing one request at a time
        this.activeRequest = request();
        try {
          await this.activeRequest;
        } catch (error) {
          // We catch here but the original error is still propagated to the caller
          console.error('[STRICT QUEUE] Request failed but queue continues:', error);
        } finally {
          this.activeRequest = null;
        }
      }

      console.log(`✅ [STRICT QUEUE] Queue processing complete. Processed ${this.totalProcessed} requests with ${this.totalErrors} errors.`);
    } catch (error) {
      console.error('❌ [STRICT QUEUE] Fatal error processing queue:', error);
    } finally {
      this.isProcessing = false;
      this.lastRequestTime = 0;
      insightsQueueState.unlock();
      
      // Log processing duration
      const duration = Date.now() - this.queueStartTime;
      console.log(`⏱️ [STRICT QUEUE] Queue processing took ${duration}ms`);
    }
  }

  /**
   * Check if the queue is currently processing
   */
  public isActive(): boolean {
    return this.isProcessing || this.processingCount > 0;
  }

  /**
   * Get current queue stats
   */
  public getStats() {
    return {
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessing,
      totalProcessed: this.totalProcessed,
      totalErrors: this.totalErrors,
      activeRequests: this.processingCount,
    };
  }

  /**
   * Clear the queue and reset state
   */
  public clearQueue(): void {
    this.requestQueue = [];
    this.isProcessing = false;
    this.processingLock = false;
    this.lastRequestTime = 0;
    this.activeRequest = null;
    console.log('🧹 [STRICT QUEUE] Queue cleared');
  }
}

// Export the singleton instance
export const strictInsightsQueue = StrictQueueManager.getInstance();
