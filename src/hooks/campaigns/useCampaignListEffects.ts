
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

export const useCampaignListEffects = ({
  isLoading,
  campaigns,
  fetchCompleted,
  insightsFetchStatus,
  refetchCampaigns,
  forceUiRefresh
}: {
  isLoading: boolean;
  campaigns: any[];
  fetchCompleted: boolean;
  insightsFetchStatus: string | null;
  refetchCampaigns: (force: boolean) => void;
  forceUiRefresh: () => void;
}) => {
  // Force a fetch on component mount if authenticated but no campaigns loaded
  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const selectedAdAccount = localStorage.getItem('selected_ad_account');
    const hasAuth = token && token.length > 50 && selectedAdAccount;
    const campaignsFetched = localStorage.getItem('last_campaign_fetch_completed');
    const hasRecentFetch = campaignsFetched && (Date.now() - new Date(campaignsFetched).getTime() < 60000);
    
    if (hasAuth && !isLoading && campaigns.length === 0 && !hasRecentFetch) {
      console.log('[CAMPAIGN LIST] Authenticated but no campaigns or old data, forcing fetch');
      refetchCampaigns(true);
    }
  }, []);
  
  // Listen for date preset changes and trigger a refresh
  useEffect(() => {
    const handleDatePresetChange = () => {
      console.log('[CAMPAIGN LIST] Date preset changed, refreshing campaigns');
      refetchCampaigns(true);
    };
    
    window.addEventListener('campaign-date-preset-changed', handleDatePresetChange);
    return () => {
      window.removeEventListener('campaign-date-preset-changed', handleDatePresetChange);
    };
  }, [refetchCampaigns]);
  
  // Add safety timeout to exit loading state if stuck
  useEffect(() => {
    let safetyTimeout: number | undefined;
    
    if (isLoading) {
      console.log(`[CAMPAIGN LIST] Loading state started, setting safety timeout`);
      safetyTimeout = window.setTimeout(() => {
        if (isLoading) {
          console.log('[CAMPAIGN LIST] Safety timeout triggered - forcing exit from loading state');
          toast({
            title: "Loading timeout",
            description: "Campaign loading took too long. Please try refreshing.",
            variant: "destructive",
          });
          refetchCampaigns(true);
        }
      }, 15000);
    }
    
    return () => {
      if (safetyTimeout) {
        window.clearTimeout(safetyTimeout);
      }
    };
  }, [isLoading, refetchCampaigns]);
  
  // Track insight sync status to force UI refresh if needed
  useEffect(() => {
    if (fetchCompleted && campaigns.length > 0 && insightsFetchStatus !== 'success' && insightsFetchStatus !== 'partial') {
      const insightCheckTimeout = setTimeout(() => {
        const hasValidInsights = localStorage.getItem('has_valid_campaign_insights') === 'true';
        if (!hasValidInsights) {
          console.log('[CAMPAIGN LIST] No valid insights detected after campaign load, forcing UI refresh');
          forceUiRefresh();
        } else {
          console.log('[CAMPAIGN LIST] Valid insights confirmed after campaign load');
        }
      }, 1000);
      
      return () => clearTimeout(insightCheckTimeout);
    }
  }, [fetchCompleted, campaigns.length, forceUiRefresh, insightsFetchStatus]);
  
  // Force render on successful campaign data load if we have valid campaigns
  useEffect(() => {
    if (campaigns.length > 0 && fetchCompleted) {
      console.log('[CAMPAIGN LIST] Campaigns data loaded, forcing UI refresh');
      const forceRenderTimeout = setTimeout(() => {
        forceUiRefresh();
        window.dispatchEvent(new Event('force-campaign-ui-refresh'));
      }, 300);
      
      return () => clearTimeout(forceRenderTimeout);
    }
  }, [campaigns.length, fetchCompleted, forceUiRefresh]);
};
