
import { BaseApiService } from './BaseApiService';
import { CampaignFetchService } from './campaign/fetching/campaignFetchService';
import { MetaCampaign } from './types/metaCampaignTypes';
import { toast } from '@/hooks/use-toast';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string, datePreset: string = 'last_30d'): Promise<MetaCampaign[]> {
    try {
      if (!token) {
        console.error('[META CAMPAIGN] Missing access token');
        return [];
      }
      
      if (!adAccountId) {
        console.error('[META CAMPAIGN] Missing ad account ID');
        return [];
      }
      
      // Check if we should force maximum date preset due to prior empty results or fallback
      const shouldUseMaximum = localStorage.getItem('force_maximum_date_preset') === 'true';
      const effectivePreset = shouldUseMaximum ? 'maximum' : datePreset || 'last_30d';
      
      // Log information about fallback if active
      if (shouldUseMaximum) {
        const fallbackReason = localStorage.getItem('date_preset_fallback_reason') || 'Unknown reason';
        console.log(`[META CAMPAIGN] Using maximum date preset due to fallback. Reason: ${fallbackReason}`);
        
        // Notify user about fallback via toast (only once)
        if (!localStorage.getItem('fallback_notified')) {
          toast({
            title: "Using extended date range",
            description: "Fallback triggered: using maximum date range to find all campaigns.",
            duration: 5000
          });
          localStorage.setItem('fallback_notified', 'true');
        }
      }
      
      console.log(`[META CAMPAIGN] Fetching campaigns for account ${adAccountId} with date preset ${effectivePreset} (original: ${datePreset || 'last_30d'})`);
      
      // Log full request details for debugging
      console.log('[META CAMPAIGN] Full request details:', {
        tokenLength: token ? token.length : 0,
        adAccountId: adAccountId,
        datePreset: effectivePreset,
        forcingMaximum: shouldUseMaximum,
        timestamp: new Date().toISOString()
      });
      
      // Store timestamp of fetch attempt
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_fetch_account', adAccountId);
      localStorage.setItem('last_fetch_date_preset', effectivePreset);
      
      // Use the effective date preset (maximum if forced, otherwise the provided preset or last_30d)
      const campaigns = await CampaignFetchService.fetchCampaigns(token, adAccountId, effectivePreset);
      
      // If we got campaigns with maximum preset, keep the flag for UI notification purposes
      // but only clear it from storage if we specifically want to reset it
      if (shouldUseMaximum && campaigns.length > 0) {
        console.log('[META CAMPAIGN] Successfully retrieved campaigns with maximum date preset');
      }
      
      // Log raw campaign data before any processing
      console.log('[MetaCampaignService] PIPELINE RAW INPUT - Raw campaigns response:', campaigns);
      
      // IMPORTANT: Ensure we always return an array, even if empty
      const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
      
      // No filtering or transformation - pass ALL campaigns through
      console.log('[MetaCampaignService] BYPASSING FILTERS - Using all campaigns');
      
      // Log success information
      console.log(`[META CAMPAIGN] Successfully fetched ${safeCampaigns.length} campaigns`);
      
      // Add IDs to any campaigns without them
      safeCampaigns.forEach((campaign, index) => {
        if (!campaign.id) {
          campaign.id = `generated-id-${index}`;
          console.warn(`[META CAMPAIGN] Generated ID for campaign: ${campaign.name || 'unnamed'}`);
        }
      });
      
      // Log the final output before returning
      console.log('[MetaCampaignService] PIPELINE OUTPUT - Returning campaigns:', {
        count: safeCampaigns.length,
        hasEmptyObjects: safeCampaigns.some(c => Object.keys(c).length === 0),
        allHaveIds: safeCampaigns.every(c => !!c.id)
      });
      
      // Reset fallback notification flag when successful
      if (safeCampaigns.length > 0) {
        localStorage.removeItem('fallback_notified');
      }
      
      return safeCampaigns;
    } catch (error) {
      console.error('[META CAMPAIGN] Error in fetchCampaigns:', error);
      
      // Check if error is related to date preset
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDatePresetError = 
        errorMessage.includes('preset') || 
        errorMessage.includes('date_preset') || 
        errorMessage.includes('parameter');
      
      // If it's a date preset error, trigger fallback to maximum
      if (isDatePresetError) {
        console.warn('[META CAMPAIGN] Detected date preset error, triggering fallback to maximum');
        localStorage.setItem('force_maximum_date_preset', 'true');
        localStorage.setItem('date_preset_fallback_reason', `API error: ${errorMessage}`);
        
        // Retry with maximum date preset
        try {
          console.log('[META CAMPAIGN] Retrying with maximum date preset');
          return await this.fetchCampaigns(token, adAccountId, 'maximum');
        } catch (retryError) {
          console.error('[META CAMPAIGN] Retry with maximum date preset also failed:', retryError);
        }
      }
      
      // Log error in the requested format
      console.error('[MetaCampaignService] Failed to fetch campaigns:', error);
      
      // Store error information for debugging
      try {
        localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[META CAMPAIGN] Error storing fetch error details:', e);
      }
      
      // Always return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }
}
