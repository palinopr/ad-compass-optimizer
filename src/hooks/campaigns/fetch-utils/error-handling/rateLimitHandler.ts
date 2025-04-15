
import { toast } from "@/hooks/use-toast";
import { isRateLimitError, markRateLimited } from '../rateLimit';

export const handleRateLimitError = (err: any, onFetchFailure?: () => void) => {
  // Notify of fetch failure
  onFetchFailure?.();
  
  console.log('Rate limit error detected in catch block');
  
  // Store rate limit timestamp if not already stored
  if (!localStorage.getItem('meta_rate_limit_timestamp')) {
    markRateLimited();
  }
  
  // Show specific toast for rate limiting
  toast({
    title: "API Rate Limit",
    description: "Meta API is rate limited. Please wait 5-10 minutes before trying again.",
    variant: "destructive",
    duration: 10000
  });
  
  return { 
    error: 'Meta API rate limit reached. Please wait 5-10 minutes before trying again.',
    errorDetails: err?.details || {
      error: {
        code: 4,
        message: 'Application request limit reached',
        isRateLimit: true,
        status: 429
      }
    }
  };
};
