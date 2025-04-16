
import { useEffect } from 'react';

export function useInitialFetch(
  campaigns: any[],
  isLoading: boolean,
  hasEverHadCampaignsRef: React.MutableRefObject<boolean>,
  forceUiRefresh: () => void,
  setLocalForceRender: (cb: (prev: number) => number) => void
) {
  // Force a UI update whenever campaigns change
  useEffect(() => {
    if (campaigns.length > 0 && !isLoading) {
      console.log(`[CAMPAIGN FETCH] Campaigns updated (${campaigns.length}), forcing UI refresh`);
      // Small timeout to ensure state is settled
      setTimeout(() => {
        setLocalForceRender(prev => prev + 1);
      }, 50);
    }
  }, [campaigns, isLoading, setLocalForceRender]);

  // Set hasEverHadCampaigns when campaigns are loaded
  useEffect(() => {
    if (campaigns.length > 0) {
      hasEverHadCampaignsRef.current = true;
    }
  }, [campaigns, hasEverHadCampaignsRef]);
}
