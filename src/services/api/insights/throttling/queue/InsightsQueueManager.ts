
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { insightsQueueState, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class InsightsQueueManager {
  private static instance: InsightsQueueManager;
  private isProcessing = false;
  private requestQueue: Array<() => Promise<any>> = [];
  private lastRequestTime = 0;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): InsightsQueueManager {
    if (!InsightsQueueManager.instance) {
      InsightsQueueManager.instance = new InsightsQueueManager();
    }
    return InsightsQueueManager.instance;
  }

  public enqueueRequest(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Start processing if not already running
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    // Check global throttling state
    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn('Global throttling active - pausing queue processing');
      return;
    }

    // Check queue lock
    if (insightsQueueState.isActiveLock()) {
      console.warn('Queue is locked - pausing processing');
      return;
    }

    this.isProcessing = true;

    try {
      while (this.requestQueue.length > 0) {
        // Enforce minimum time between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
          const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          console.log(`⏳ Enforcing minimum interval, waiting ${waitTime}ms before next request`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const request = this.requestQueue.shift();
        if (request) {
          console.log(`🚀 Processing next request from queue (${this.requestQueue.length} remaining)`);
          this.lastRequestTime = Date.now();
          await request();
        }
      }
    } finally {
      this.isProcessing = false;
      console.log('✅ Queue processing complete');
    }
  }

  public clearQueue(): void {
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
  }
}

// Create and export the singleton instance
export const insightsQueue = InsightsQueueManager.getInstance();
