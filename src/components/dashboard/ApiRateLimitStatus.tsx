
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetaApiService } from '@/services/MetaApiService';
import { Progress } from '@/components/ui/progress';

const ApiRateLimitStatus = () => {
  const [isRateLimited, setIsRateLimited] = useState<boolean>(MetaApiService.isRateLimited());
  const [remainingTime, setRemainingTime] = useState<number | null>(MetaApiService.getRateLimitTimeRemaining());
  const [remainingPercent, setRemainingPercent] = useState<number>(0);
  
  useEffect(() => {
    // Update the initial state
    setIsRateLimited(MetaApiService.isRateLimited());
    setRemainingTime(MetaApiService.getRateLimitTimeRemaining());
    
    // Function to update the timer
    const updateTimer = () => {
      const remaining = MetaApiService.getRateLimitTimeRemaining();
      setRemainingTime(remaining);
      setIsRateLimited(MetaApiService.isRateLimited());
      
      // Calculate percentage if we know the original retry time
      const rateLimitData = localStorage.getItem('meta_rate_limit_retry_after');
      if (rateLimitData && remaining) {
        const originalSeconds = parseInt(rateLimitData, 10);
        const percentRemaining = (remaining / originalSeconds) * 100;
        setRemainingPercent(100 - percentRemaining);
      }
    };
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    // Listen for rate limit events
    const handleRateLimit = (e: CustomEvent) => {
      setIsRateLimited(true);
      setRemainingTime(e.detail?.retryAfter || 300);
      setRemainingPercent(0);
    };
    
    const handleRateLimitCleared = () => {
      setIsRateLimited(false);
      setRemainingTime(null);
      setRemainingPercent(100);
    };
    
    window.addEventListener('meta-api-rate-limited', handleRateLimit as EventListener);
    window.addEventListener('meta-api-rate-limit-cleared', handleRateLimitCleared);
    
    // Cleanup
    return () => {
      clearInterval(timerId);
      window.removeEventListener('meta-api-rate-limited', handleRateLimit as EventListener);
      window.removeEventListener('meta-api-rate-limit-cleared', handleRateLimitCleared);
    };
  }, []);
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleClearRateLimit = () => {
    MetaApiService.clearRateLimit();
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {isRateLimited ? (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          Meta API Rate Limit Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isRateLimited ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-sm border border-amber-200">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                API rate limit active. Please wait.
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Time remaining until API access resumes:</span>
                <span className="font-medium">{remainingTime ? formatTimeRemaining(remainingTime) : 'Unknown'}</span>
              </div>
              <Progress value={remainingPercent} className="h-1.5" />
            </div>
            
            <div className="text-xs text-gray-600">
              <p>Meta's API has rate limits to prevent abuse. Your application has reached this limit and needs to wait before making more requests.</p>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearRateLimit}
                className="text-xs w-full"
              >
                Override Rate Limit (Dev Only)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-sm border border-green-200">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                API rate limit is not active
              </span>
            </div>
            
            <div className="text-xs text-gray-600">
              <p>Meta's API has usage limits. Fetch data mindfully to avoid hitting rate limits. If you encounter a rate limit, the system will automatically queue requests and process them once the limit expires.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiRateLimitStatus;
