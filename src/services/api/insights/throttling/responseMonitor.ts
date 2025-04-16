
import { RateLimitManager } from '../../rate-limit/RateLimitManager';
import { ThrottleStorage } from './storage';

export class ResponseMonitor {
  static monitorHeaders(response: Response): void {
    try {
      const usageHeader = response.headers.get('x-business-use-case-usage') || 
                         response.headers.get('x-app-usage') ||
                         response.headers.get('x-ad-account-usage');
      
      if (usageHeader) {
        const usage = JSON.parse(usageHeader);
        this.checkUsageMetrics(usage);
      }
    } catch (e) {
      console.error('[INSIGHTS] Error monitoring response headers:', e);
    }
  }

  private static checkUsageMetrics(usage: any): void {
    try {
      // Store usage data for monitoring
      ThrottleStorage.storeUsageData({
        appUsage: JSON.stringify(usage.app_usage || usage),
        businessUsage: JSON.stringify(usage.business_usage || usage)
      });

      const hasHighUsage = Object.values(usage).some((metric: any) => 
        typeof metric === 'object' && 
        (metric.call_count > 80 || metric.total_cputime > 80 || metric.total_time > 80)
      );
      
      if (hasHighUsage) {
        console.warn('[INSIGHTS] High API usage detected:', usage);
        ThrottleStorage.storeThrottleData('default', 30);
      }

      const hasCriticalUsage = Object.values(usage).some((metric: any) => 
        typeof metric === 'object' && 
        (metric.call_count > 95 || metric.total_cputime > 95 || metric.total_time > 95)
      );
      
      if (hasCriticalUsage) {
        console.error('[INSIGHTS] Critical API usage detected');
        RateLimitManager.setRateLimit(300);
      }
    } catch (e) {
      console.error('[INSIGHTS] Error checking usage metrics:', e);
    }
  }
}
