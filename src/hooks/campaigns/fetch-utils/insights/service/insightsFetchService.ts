
import { INSIGHTS_HEADERS } from '../constants';
import { buildInsightsUrl } from '../insightsUrlBuilder';
import { InsightsThrottling } from '@/services/api/insights/throttling/InsightsThrottling';
import { processInsightsData } from '../insightsProcessor';
import { validateDatePreset } from '../datePresetValidator';
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';

export const fetchCampaignInsightData = async (
  campaignId: string,
  token: string,
  datePreset: string = 'last_30d'
): Promise<CampaignExtraStats | null> => {
  const validDatePreset = validateDatePreset(datePreset);
  console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
  
  const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'default';
  InsightsThrottling.checkThrottling(selectedAdAccount);
  
  const url = buildInsightsUrl(campaignId, token, validDatePreset);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: INSIGHTS_HEADERS
  });
  
  InsightsThrottling.monitorResponseHeaders(response);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, errorData);
    throw { ...errorData, status: response.status, response };
  }
  
  const data = await response.json();
  
  if (!data || !data.data || data.data.length === 0) {
    console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
    return null;
  }
  
  const insightsData = data.data[0];
  return processInsightsData(insightsData);
};
