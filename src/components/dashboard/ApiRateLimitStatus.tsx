
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, Hourglass, Users, Database, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetaApiService } from '@/services/MetaApiService';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ApiRateLimitStatus = () => {
  const [isRateLimited, setIsRateLimited] = useState<boolean>(MetaApiService.isRateLimited());
  const [remainingTime, setRemainingTime] = useState<number | null>(MetaApiService.getRateLimitTimeRemaining());
  const [remainingPercent, setRemainingPercent] = useState<number>(0);
  const [limitType, setLimitType] = useState<string>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOverridden, setIsOverridden] = useState<boolean>(MetaApiService.isRateLimitOverridden());
  
  useEffect(() => {
    // Update the initial state
    setIsRateLimited(MetaApiService.isRateLimited());
    setRemainingTime(MetaApiService.getRateLimitTimeRemaining());
    setIsOverridden(MetaApiService.isRateLimitOverridden());
    
    // Get the limit type
    const rateLimitInfo = MetaApiService.getRateLimitInfo();
    setLimitType(rateLimitInfo.limitType || 'unknown');
    setErrorMessage(rateLimitInfo.errorMessage || null);
    
    // Function to update the timer
    const updateTimer = () => {
      const remaining = MetaApiService.getRateLimitTimeRemaining();
      setRemainingTime(remaining);
      setIsRateLimited(MetaApiService.isRateLimited());
      setIsOverridden(MetaApiService.isRateLimitOverridden());
      
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
      setLimitType(e.detail?.limitType || 'unknown');
      setErrorMessage(e.detail?.errorMessage || null);
    };
    
    const handleRateLimitCleared = () => {
      setIsRateLimited(false);
      setRemainingTime(null);
      setRemainingPercent(100);
      setLimitType('unknown');
      setErrorMessage(null);
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
  
  const handleToggleOverride = () => {
    MetaApiService.overrideRateLimit(!isOverridden);
    setIsOverridden(!isOverridden);
  };
  
  // Get the appropriate icon based on limit type
  const getLimitIcon = () => {
    switch (limitType) {
      case 'app':
        return <Database className="h-4 w-4 mr-1" />;
      case 'user':
        return <Users className="h-4 w-4 mr-1" />;
      case 'adaccount':
        return <Database className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  // Get descriptive text for limit type
  const getLimitTypeText = () => {
    switch (limitType) {
      case 'app':
        return "Application Rate Limit";
      case 'user':
        return "User Rate Limit";
      case 'adaccount':
        return "Ad Account Rate Limit";
      default:
        return "API Rate Limit";
    }
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
          
          {isOverridden && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Override
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rate limit checks are being bypassed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isRateLimited ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-sm border border-amber-200">
              {getLimitIcon()}
              <span className="text-sm font-medium">
                {getLimitTypeText()} active. Please wait.
              </span>
            </div>
            
            {errorMessage && (
              <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-sm border border-amber-200">
                <div className="flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
            
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
            
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearRateLimit}
                className="text-xs"
              >
                Clear Rate Limit
              </Button>
              
              <Button 
                variant={isOverridden ? "destructive" : "outline"} 
                size="sm" 
                onClick={handleToggleOverride}
                className="text-xs"
              >
                {isOverridden ? "Disable Override" : "Override Limit"}
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
            
            {isOverridden && (
              <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-800">
                <span className="font-bold">Override Active:</span> Rate limit checks are currently bypassed. Only use this for development.
                
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToggleOverride}
                    className="text-xs w-full"
                  >
                    Disable Override
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiRateLimitStatus;
