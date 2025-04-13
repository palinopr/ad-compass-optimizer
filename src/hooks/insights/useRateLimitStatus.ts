
import { useState, useCallback } from 'react';
import { MetaApiService } from '@/services/MetaApiService';

interface RateLimitStatusState {
  isRateLimited: boolean;
  limitType?: string;
  timeRemaining?: number | null;
}

export function useRateLimitStatus() {
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatusState>({
    isRateLimited: MetaApiService.isRateLimited(),
    limitType: MetaApiService.getRateLimitInfo().limitType,
    timeRemaining: MetaApiService.getRateLimitTimeRemaining()
  });
  
  const updateRateLimitStatus = useCallback(() => {
    const rateLimitInfo = MetaApiService.getRateLimitInfo();
    setRateLimitStatus({
      isRateLimited: MetaApiService.isRateLimited(),
      limitType: rateLimitInfo.limitType,
      timeRemaining: MetaApiService.getRateLimitTimeRemaining()
    });
  }, []);
  
  const clearRateLimit = useCallback(() => {
    MetaApiService.clearRateLimit();
    updateRateLimitStatus();
  }, [updateRateLimitStatus]);
  
  return {
    rateLimitStatus,
    updateRateLimitStatus,
    clearRateLimit
  };
}
