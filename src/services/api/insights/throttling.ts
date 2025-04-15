
import { checkRateLimitStatus, markRateLimited } from '@/hooks/campaigns/fetch-utils/rateLimitStatus';
import { toast } from '@/hooks/use-toast';

export class InsightsThrottling {
  private static readonly THROTTLE_STORAGE_KEY = 'meta_insights_throttle';

  public static checkThrottling(accountId: string = 'default'): void {
    // Check if rate limited first
    const rateStatus = checkRateLimitStatus(accountId);
    if (rateStatus.isRateLimited) {
      console.warn(`Meta API rate limited for account ${accountId}. Remaining: ${rateStatus.timeRemaining} minutes`);
      toast({
        title: "API Rate Limited",
        description: `Meta API is rate limited. Try again in ${rateStatus.timeRemaining} minutes.`,
        variant: "destructive",
        duration: 5000,
      });
      throw new Error(`Rate limit active. Try again in ${rateStatus.timeRemaining} minutes.`);
    }

    // Check for API throttling
    try {
      const throttleKey = `${this.THROTTLE_STORAGE_KEY}_${accountId}`;
      const throttleData = localStorage.getItem(throttleKey);
      
      if (throttleData) {
        const { expiryTime } = JSON.parse(throttleData);
        const now = Date.now();
        
        if (now < expiryTime) {
          const remainingSeconds = Math.ceil((expiryTime - now) / 1000);
          console.warn(`API requests throttled for ${remainingSeconds} seconds`);
          toast({
            title: "API Throttled",
            description: `Too many requests. Please wait ${remainingSeconds} seconds.`,
            variant: "destructive",
          });
          throw new Error(`API throttled. Try again in ${remainingSeconds} seconds.`);
        } else {
          localStorage.removeItem(throttleKey);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('API throttled')) {
        throw e;
      }
      console.error('Error checking insights throttling:', e);
    }
  }

  public static markThrottled(accountId: string = 'default', durationSeconds: number = 5): void {
    try {
      const throttleKey = `${this.THROTTLE_STORAGE_KEY}_${accountId}`;
      const now = Date.now();
      const expiryTime = now + (durationSeconds * 1000);
      
      localStorage.setItem(throttleKey, JSON.stringify({ expiryTime }));
    } catch (e) {
      console.error('Error marking insights throttled:', e);
    }
  }
}
