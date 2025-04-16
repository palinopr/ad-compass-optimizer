
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useLoadingTimeout(
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  setFetchCompleted: (completed: boolean) => void,
  setInsightsFetchStatus: (status: 'pending' | 'success' | 'partial' | 'failed' | null) => void,
  hasEverHadCampaignsRef: React.MutableRefObject<boolean>,
  campaigns: any[]
) {
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        // If we're still loading after 10 seconds, force exit loading state
        if (isLoading) {
          console.log('[CAMPAIGN FETCH] Safety timeout: forcing exit from loading state');
          setIsLoading(false);
          setFetchCompleted(true);
          
          // Check if we have any campaign data before marking insights as failed
          const campaignDataExists = campaigns.length > 0 || localStorage.getItem('has_campaigns_data') === 'true';
          if (campaignDataExists) {
            setInsightsFetchStatus('partial');
          } else {
            setInsightsFetchStatus('failed');
          }
        }
      }, 10000); // 10 second safety timeout
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, hasEverHadCampaignsRef, campaigns.length, setIsLoading, setFetchCompleted, setInsightsFetchStatus]);
}
