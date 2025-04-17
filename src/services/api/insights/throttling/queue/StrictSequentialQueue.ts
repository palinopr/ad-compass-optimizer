
/**
 * StrictSequentialQueue - Ensures truly sequential processing with no possibility of overlap
 */

import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { insightsQueueState, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

interface QueueItem<T = any> {
  id: string;
  request: () => Promise<T>;
  startTime?: number;
}

export class StrictSequentialQueue {
  private static instance: StrictSequentialQueue;
  private isProcessing = false;
  private activeRequest: Promise<any> | null = null;
  private requestQueue: QueueItem[] = [];
  private processingCount = 0;
  private lastRequestTime = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.reset());
    }
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
      throw new Error('Global throttling active');
    }

    // Queue lock check
    if (insightsQueueState.isActiveLock()) {
      throw new Error('Queue is locked');
    }

    console.log(`🔄 [QUEUE] Adding request ${requestId} to queue`);

    return new Promise<T>((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        id: requestId,
        request: async () => {
          try {
            this.processingCount++;
            console.log(`⏳ [QUEUE] Processing request ${requestId}`);
            const result = await request();
            return result;
          } catch (error) {
            console.error(`❌ [QUEUE] Error processing ${requestId}:`, error);
            throw error;
          } finally {
            this.processingCount--;
          }
        },
        startTime: Date.now()
      };

      // Add to queue and process
      this.requestQueue.push(queueItem);
      this.processQueue()
        .then(results => {
          const result = results.find(r => r.id === requestId);
          if (result?.error) {
            reject(result.error);
          } else {
            resolve(result?.data as T);
          }
        })
        .catch(reject);
    });
  }

  private async processQueue(): Promise<Array<{ id: string; data?: any; error?: any }>> {
    if (this.isProcessing) {
      console.log('⏸️ Queue already processing, waiting...');
      return [];
    }

    this.isProcessing = true;
    insightsQueueState.lock();
    const results: Array<{ id: string; data?: any; error?: any }> = [];

    try {
      while (this.requestQueue.length > 0) {
        const item = this.requestQueue.shift();
        if (!item) continue;

        // Enforce minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
          const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          console.log(`⏳ Waiting ${waitTime}ms before next request`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        try {
          console.log(`🚀 [QUEUE] Executing request ${item.id}`);
          const result = await item.request();
          results.push({ id: item.id, data: result });
          this.lastRequestTime = Date.now();
        } catch (error) {
          console.error(`❌ [QUEUE] Request ${item.id} failed:`, error);
          results.push({ id: item.id, error });
        }

        // Additional delay after each request
        await new Promise(resolve => setTimeout(resolve, THROTTLING_CONFIG.MIN_REQUEST_INTERVAL));
      }
    } finally {
      this.isProcessing = false;
      this.activeRequest = null;
      insightsQueueState.unlock();
    }

    return results;
  }

  public isActive(): boolean {
    return this.isProcessing || this.processingCount > 0;
  }

  public reset(): void {
    this.requestQueue = [];
    this.isProcessing = false;
    this.activeRequest = null;
    this.processingCount = 0;
    this.lastRequestTime = 0;
    insightsQueueState.clear();
    console.log('🧹 Queue reset complete');
  }
}

// Export the singleton instance
export const strictSequentialQueue = StrictSequentialQueue.getInstance();
