
import { useState } from 'react';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { fetchInsightsForCampaigns } from '../fetch-utils/campaignInsightsFetcher';
import { metaAuthService } from '@/services/MetaAuthService';

export const useInsightsFetching = () => {
  const [insightsFetchStatus, setInsightsFetchStatus] = useState<'pending' | 'success' | 'partial' | 'failed' | null>(null);
  const [isInsightsFetching, setIsInsightsFetching] = useState(false);

  const updateCampaignsWithInsights = async (campaigns: MetaCampaign[]) => {
    if (isInsightsFetching) {
      console.log('[INSIGHTS] Fetch already in progress, skipping');
      return { success: false, partial: false, skipped: true };
    }

    try {
      setIsInsightsFetching(true);
      setInsightsFetchStatus('pending');
      const token = metaAuthService.getAccessToken();

      if (token && campaigns.length > 0) {
        console.log(`[INSIGHTS] Fetching insights for ${campaigns.length} campaigns`);
        const enhancedCampaigns = await fetchInsightsForCampaigns(campaigns, token);

        const campaignsWithAnyInsights = enhancedCampaigns.filter(
          campaign => campaign.insights && Object.keys(campaign.insights).length > 0
        );

        if (campaignsWithAnyInsights.length === enhancedCampaigns.length && enhancedCampaigns.length > 0) {
          setInsightsFetchStatus('success');
          return { success: true, partial: false, campaigns: enhancedCampaigns };
        } else if (campaignsWithAnyInsights.length > 0) {
          console.log(`[INSIGHTS] Partial success: ${campaignsWithAnyInsights.length}/${enhancedCampaigns.length} campaigns have insights`);
          setInsightsFetchStatus('partial');
          return { success: false, partial: true, campaigns: enhancedCampaigns };
        }
        
        console.log('[INSIGHTS] Failed to fetch insights, but returning campaigns with metadata');
        setInsightsFetchStatus('failed');
        return { success: false, partial: false, campaigns: enhancedCampaigns };
      }
    } catch (error) {
      console.error('[INSIGHTS] Error fetching insights:', error);
      setInsightsFetchStatus('failed');
      // Still return the original campaigns even if insights fetch failed
      return { success: false, partial: false, campaigns, error };
    } finally {
      setIsInsightsFetching(false);
    }

    return { success: false, partial: false };
  };

  return {
    insightsFetchStatus,
    isInsightsFetching,
    updateCampaignsWithInsights
  };
};
