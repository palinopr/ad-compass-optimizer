
export class RequestQueueManager {
  private static requestQueue: (() => Promise<any>)[] = [];
  private static isProcessingQueue = false;

  public static async addToQueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          const result = await requestFn();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };
      
      this.requestQueue.push(wrappedRequest);
      console.log(`Request added to queue. Queue size: ${this.requestQueue.length}`);
      
      this.processQueue();
    });
  }

  private static async processQueue() {
    if (this.isProcessingQueue) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift();
        if (request) {
          try {
            await request();
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.error('Error processing queued request:', error);
            break;
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }
}
