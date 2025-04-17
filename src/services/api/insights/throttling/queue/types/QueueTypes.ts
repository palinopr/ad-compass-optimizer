
export interface QueueItem<T = any> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  startTime: number;
}

export interface QueueStats {
  queueSize: number;
  isProcessing: boolean;
  activeRequests: number;
}
