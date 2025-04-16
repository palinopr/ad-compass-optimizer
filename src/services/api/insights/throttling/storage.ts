
import { IUsageData, IThrottleInfo } from './types';

export const THROTTLE_STORAGE_KEY = 'meta_insights_throttle';

export class ThrottleStorage {
  private static getThrottleKey(accountId: string): string {
    return `${THROTTLE_STORAGE_KEY}_${accountId}`;
  }

  static storeThrottleData(accountId: string, durationSeconds: number): void {
    try {
      const throttleKey = this.getThrottleKey(accountId);
      const now = Date.now();
      const expiryTime = now + (durationSeconds * 1000);
      
      localStorage.setItem(throttleKey, JSON.stringify({ expiryTime }));
    } catch (e) {
      console.error('[THROTTLE STORAGE] Error storing throttle data:', e);
    }
  }

  static getThrottleData(accountId: string): IThrottleInfo | null {
    try {
      const throttleKey = this.getThrottleKey(accountId);
      const data = localStorage.getItem(throttleKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[THROTTLE STORAGE] Error reading throttle data:', e);
      return null;
    }
  }

  static storeUsageData(usage: IUsageData): void {
    try {
      localStorage.setItem('meta_api_last_usage', JSON.stringify({
        ...usage,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error('[THROTTLE STORAGE] Error storing usage data:', e);
    }
  }
}
