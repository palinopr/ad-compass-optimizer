
export interface QueueItem<T = any> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  startTime?: number;
}

export interface QueueStats {
  queueSize: number;
  isProcessing: boolean;
  activeRequests: number;
}
