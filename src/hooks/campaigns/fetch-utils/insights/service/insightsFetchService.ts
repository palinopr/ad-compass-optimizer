
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
  
  // DEBUG: Log the full URL with token redacted for debugging
  const debugUrl = url.replace(token, 'REDACTED_TOKEN');
  console.log(`[INSIGHTS FETCH] Full request URL: ${debugUrl}`);
  
  // Verify date_preset is in the URL before proceeding
  if (!url.includes('date_preset=') && !url.includes('time_range=')) {
    console.error(`[INSIGHTS FETCH] CRITICAL ERROR: URL is missing date_preset parameter for campaign ${campaignId}`);
    throw new Error(`Missing date_preset in insights URL for campaign ${campaignId}`);
  }
  
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
