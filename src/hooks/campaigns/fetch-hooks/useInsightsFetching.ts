import { useState } from 'react';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { fetchInsightsForCampaigns } from '../fetch-utils/campaignInsightsFetcher';
import { metaAuthService } from '@/services/MetaAuthService';
import { isCampaignBlocked } from '../fetch-utils/insights/singleCampaignFetcher';

export const useInsightsFetching = () => {
  const [insightsFetchStatus, setInsightsFetchStatus] = useState<'pending' | 'success' | 'partial' | 'failed' | null>(null);
  const [isInsightsFetching, setIsInsightsFetching] = useState(false);
  const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';

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
        
        // PRE-FILTER: Filter out all blocked campaigns before starting the batch process
        const filteredCampaigns = campaigns.filter(campaign => {
          // Skip already blocked campaigns
          if (campaign.insightsStatus === 'blocked') {
            console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
            return false;
          }
          
          // Check if campaign is blocked using our helper
          if (isCampaignBlocked(campaign.id)) {
            console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
            // Update in-memory status to match
            campaign.insightsStatus = 'blocked';
            campaign.insights = null;
            return false;
          }
          
          return true;
        });
        
        console.log(`[INSIGHTS] After filtering blocked campaigns: ${filteredCampaigns.length}/${campaigns.length} will be processed`);
        
        // Only fetch insights for non-blocked campaigns
        const enhancedCampaigns = 
          filteredCampaigns.length > 0 
            ? await fetchInsightsForCampaigns(filteredCampaigns, token)
            : campaigns;

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
    setInsightsFetchStatus,
    isInsightsFetching,
    updateCampaignsWithInsights
  };
};
