
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MetaApiService } from '@/services/MetaApiService';

// Import refactored components
import RateLimitHeader from './RateLimitHeader';
import RateLimitAlert from './RateLimitAlert';
import RateLimitCountdown from './RateLimitCountdown';
import RateLimitExplanation from './RateLimitExplanation';
import RateLimitStatusInfo from './RateLimitStatusInfo';
import RateLimitControls from './RateLimitControls';

const ApiRateLimitStatus = () => {
  const [isRateLimited, setIsRateLimited] = useState<boolean>(MetaApiService.isRateLimited());
  const [remainingTime, setRemainingTime] = useState<number | null>(MetaApiService.getRateLimitTimeRemaining());
  const [remainingPercent, setRemainingPercent] = useState<number>(0);
  const [limitType, setLimitType] = useState<string>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOverridden, setIsOverridden] = useState<boolean>(MetaApiService.isRateLimitOverridden());
  
  useEffect(() => {
    const updateTimer = () => {
      const rateLimitInfo = MetaApiService.getRateLimitInfo();
      const isCurrentlyRateLimited = MetaApiService.isRateLimited();
      
      setIsRateLimited(isCurrentlyRateLimited);
      setRemainingTime(MetaApiService.getRateLimitTimeRemaining());
      setLimitType(rateLimitInfo.limitType || 'unknown');
      setErrorMessage(rateLimitInfo.errorMessage || null);
      setIsOverridden(MetaApiService.isRateLimitOverridden());
      
      // Reset states if not rate limited
      if (!isCurrentlyRateLimited) {
        setRemainingTime(null);
        setRemainingPercent(100);
        setErrorMessage(null);
      }
    };
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    // Initial update
    updateTimer();
    
    // Cleanup
    return () => {
      clearInterval(timerId);
    };
  }, []);
  
  const handleClearRateLimit = () => {
    MetaApiService.clearRateLimit();
    setIsRateLimited(false);
    setRemainingTime(null);
    setRemainingPercent(100);
    setLimitType('unknown');
    setErrorMessage(null);
  };
  
  const handleToggleOverride = () => {
    MetaApiService.overrideRateLimit(!isOverridden);
    setIsOverridden(!isOverridden);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <RateLimitHeader isRateLimited={isRateLimited} isOverridden={isOverridden} />
      </CardHeader>
      <CardContent>
        {isRateLimited ? (
          <div className="space-y-3">
            <RateLimitAlert limitType={limitType} errorMessage={errorMessage} />
            <RateLimitCountdown remainingTime={remainingTime} remainingPercent={remainingPercent} />
            <RateLimitExplanation />
            <RateLimitControls 
              isRateLimited={isRateLimited}
              isOverridden={isOverridden}
              onClearRateLimit={handleClearRateLimit}
              onToggleOverride={handleToggleOverride}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <RateLimitStatusInfo isOverridden={isOverridden} onToggleOverride={handleToggleOverride} />
            <RateLimitControls
              isRateLimited={isRateLimited}
              isOverridden={isOverridden}
              onClearRateLimit={handleClearRateLimit}
              onToggleOverride={handleToggleOverride}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiRateLimitStatus;
