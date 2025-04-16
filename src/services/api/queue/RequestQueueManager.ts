
/**
 * Request Queue Manager
 * Handles sequential processing of API requests with rate limiting
 */
export class RequestQueueManager {
  private static requestQueue: (() => Promise<any>)[] = [];
  private static isProcessingQueue = false;
  private static requestInterval = 300; // Default interval exactly as requested
  private static lastRequestTime = 0;

  /**
   * Add a request to the queue and return a promise that resolves when it's processed
   */
  public static async addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          console.log('[REQUEST QUEUE] Processing queued request');
          
          // Enforce minimum time since last request
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.requestInterval && this.lastRequestTime > 0) {
            const waitTime = this.requestInterval - timeSinceLastRequest;
            console.log(`[REQUEST QUEUE] Enforcing ${waitTime}ms delay since last request`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          
          this.lastRequestTime = Date.now();
          const result = await requestFn();
          resolve(result);
          return result;
        } catch (error) {
          console.error('[REQUEST QUEUE] Error executing queued request:', error);
          reject(error);
          throw error;
        }
      };
      
      this.requestQueue.push(wrappedRequest);
      console.log(`[REQUEST QUEUE] Request added to queue. Queue size: ${this.requestQueue.length}`);
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process requests in the queue sequentially with rate limiting
   */
  private static async processQueue() {
    if (this.isProcessingQueue) {
      console.log('[REQUEST QUEUE] Queue processing already in progress');
      return;
    }
    
    console.log('[REQUEST QUEUE] Started processing queue');
    this.isProcessingQueue = true;
    
    try {
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift();
        if (request) {
          const startTime = Date.now();
          
          try {
            await request();
          } catch (error) {
            console.error('[REQUEST QUEUE] Error processing queued request:', error);
            // Continue processing other requests even after an error
          }
          
          // Calculate and enforce minimum interval between requests
          const processingTime = Date.now() - startTime;
          const waitTime = Math.max(0, this.requestInterval - processingTime);
          
          if (waitTime > 0 && this.requestQueue.length > 0) {
            console.log(`[REQUEST QUEUE] Waiting ${waitTime}ms before next request. Queue size: ${this.requestQueue.length}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    } finally {
      console.log('[REQUEST QUEUE] Finished processing queue');
      this.isProcessingQueue = false;
    }
  }

  /**
   * Update the minimum interval between requests
   */
  public static setRequestInterval(interval: number) {
    if (interval >= 0) {
      this.requestInterval = interval;
      console.log(`[REQUEST QUEUE] Request interval updated to ${interval}ms`);
    }
  }

  /**
   * Get the current queue length
   */
  public static getQueueLength(): number {
    return this.requestQueue.length;
  }
  
  /**
   * Reset the queue and timing
   */
  public static reset() {
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
    console.log('[REQUEST QUEUE] Queue and timing reset');
  }
}
