
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { validateCampaignForInsights } from './validation/insightsFetchValidator';
import { handleInsightsFetchError } from './error/insightsErrorHandler';
import { fetchCampaignInsightData } from './service/insightsFetchService';

export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'maximum'
): Promise<CampaignExtraStats | null> => {
  try {
    // STRICT VALIDATION: First check if campaign is allowed to fetch insights
    const { isValid, reason } = validateCampaignForInsights(campaignId);
    if (!isValid) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400`);
      return null;
    }

    return await fetchCampaignInsightData(campaignId, token, datePreset);
  } catch (error: any) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    // Enhanced error handling to ensure 400 errors are properly blocked
    handleInsightsFetchError(error, campaignId);
    return null;
  }
};
