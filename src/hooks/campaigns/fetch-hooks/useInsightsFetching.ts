
import { useState } from 'react';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { fetchInsightsForCampaigns } from '../fetch-utils/campaignInsightsFetcher';
import { metaAuthService } from '@/services/MetaAuthService';

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
        
        // Load blocked campaigns immediately at the start
        let blockedCampaigns: string[] = [];
        try {
          blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
        } catch (e) {
          console.error('[INSIGHTS] Error loading blocked campaigns:', e);
        }
        
        // STRONGER PRE-FILTERING: First mark all blocked campaigns in memory
        // This ensures that any campaign loaded from storage as blocked is immediately marked
        campaigns.forEach(campaign => {
          // Check if campaign ID is in our blocklist
          if (blockedCampaigns.includes(campaign.id)) {
            console.log(`[INSIGHTS] 🚫 Skipped ${campaign.id} – insights blocked after 400`);
            // Mark campaign as blocked explicitly and null the insights
            campaign.insights = null;
            campaign.insightsStatus = 'blocked' as 'ok' | 'pending' | 'failed' | 'blocked' | null;
          }
        });
        
        // STRICT FILTERING: Apply stricter filtering to avoid processing any blocked campaigns
        const campaignsToProcess = campaigns.filter(campaign => {
          // STRICTER CHECK: First check if the campaign is already marked as blocked in memory
          if ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) === 'blocked') {
            console.log(`[INSIGHTS] 🚫 Skipped ${campaign.id} – insights blocked after 400`);
            // Make sure insights is explicitly nulled
            campaign.insights = null;
            return false;
          }
          
          // Then double-check against blocklist (for extra safety)
          const isBlocked = blockedCampaigns.includes(campaign.id);
          
          if (isBlocked) {
            console.log(`[INSIGHTS] 🚫 Skipped ${campaign.id} – insights blocked after 400`);
            // Mark campaign as blocked explicitly and null the insights
            campaign.insights = null;
            campaign.insightsStatus = 'blocked' as 'ok' | 'pending' | 'failed' | 'blocked' | null;
            return false;
          }
          
          return true;
        });
        
        console.log(`[INSIGHTS] After filtering blocked campaigns: ${campaignsToProcess.length}/${campaigns.length} will be processed`);
        
        // Only fetch insights for non-blocked campaigns
        const enhancedCampaigns = 
          campaignsToProcess.length > 0 
            ? await fetchInsightsForCampaigns(campaignsToProcess, token)
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
