
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

        const campaignsWithInsights = enhancedCampaigns.filter(
          campaign => campaign.insights && 
            ((campaign.insights.spend && campaign.insights.spend !== '-') || 
             (campaign.insights.cpa && campaign.insights.cpa !== '-') || 
             (campaign.insights.roas && campaign.insights.roas !== '-'))
        );

        if (campaignsWithInsights.length === enhancedCampaigns.length && enhancedCampaigns.length > 0) {
          setInsightsFetchStatus('success');
          return { success: true, partial: false, campaigns: enhancedCampaigns };
        } else if (campaignsWithInsights.length > 0) {
          setInsightsFetchStatus('partial');
          return { success: false, partial: true, campaigns: enhancedCampaigns };
        }
        
        setInsightsFetchStatus('failed');
        return { success: false, partial: false, campaigns: enhancedCampaigns };
      }
    } catch (error) {
      console.error('[INSIGHTS] Error fetching insights:', error);
      setInsightsFetchStatus('failed');
      return { success: false, partial: false, error };
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
