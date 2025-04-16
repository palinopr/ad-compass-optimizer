
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useLoadingSafety = (
  isLoading: boolean,
  hasEverHadCampaigns: boolean,
  onLoadingTimeout: () => void
) => {
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        if (isLoading && hasEverHadCampaigns) {
          console.log('[SAFETY] Loading timeout triggered');
          toast({
            title: "Loading timeout",
            description: "Campaign loading took too long. Please try refreshing.",
            variant: "destructive",
          });
          onLoadingTimeout();
        }
      }, 15000);
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, hasEverHadCampaigns, onLoadingTimeout]);
};
