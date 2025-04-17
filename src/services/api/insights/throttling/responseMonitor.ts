
import { ResponseHeaderMonitor } from './services/ResponseHeaderMonitor';
import { RequestThrottlingService } from './services/RequestThrottlingService';

export class ResponseMonitor {
  static monitorHeaders(response: Response): void {
    ResponseHeaderMonitor.monitorHeaders(response);
  }

  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    return RequestThrottlingService.throttleRequest(requestFn, requestId);
  }

  static reset(): void {
    RequestThrottlingService.reset();
  }
}
