
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useErrorHandling() {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((err: any, rateLimitInfo?: {
    isRateLimited: boolean;
    limitType?: string;
    timeRemaining?: number | null;
  }) => {
    console.error('Error fetching insights:', err);
    let errorMessage = err.message || 'An error occurred while fetching insights data';
    
    const isRateLimitError = errorMessage.includes('rate limit') || 
                          errorMessage.includes('request limit') || 
                          err.code === 17 || err.code === 4;
    
    if (isRateLimitError && rateLimitInfo) {
      const limitTypeText = rateLimitInfo.limitType === 'app' ? 'Application' : 
                         rateLimitInfo.limitType === 'user' ? 'User' :
                         rateLimitInfo.limitType === 'adaccount' ? 'Ad Account' : 'API';
                          
      errorMessage = `Meta ${limitTypeText} rate limit reached. Your request has been queued and will be processed when the rate limit expires.`;
    }
    
    setError(errorMessage);
    
    toast({
      title: "Error Fetching Insights",
      description: errorMessage,
      variant: "destructive",
    });
    
    return errorMessage;
  }, []);
  
  const resetErrorState = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    setError,
    handleError,
    resetErrorState
  };
}
