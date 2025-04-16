
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
  
  let url = buildInsightsUrl(campaignId, token, validDatePreset);
  
  // DEBUG: Log the full URL with token redacted for debugging
  const debugUrl = url.replace(token, 'REDACTED_TOKEN');
  console.log(`[INSIGHTS FETCH] Full request URL: ${debugUrl}`);
  
  // NEW: Added explicit check and console log to confirm date_preset is in URL
  if (!url.includes('date_preset=') && !url.includes('time_range=')) {
    console.error(`[INSIGHTS FETCH] CRITICAL ERROR: Missing date_preset in URL. Force appending it now...`);
    // Force append date_preset if missing
    const appendChar = url.includes('?') ? '&' : '?';
    url = `${url}${appendChar}date_preset=${validDatePreset}`;
    const fixedDebugUrl = url.replace(token, 'REDACTED_TOKEN');
    console.log(`[INSIGHTS FETCH] FIXED request URL: ${fixedDebugUrl}`);
  }
  
  // NEW: Log the final URL with a checkmark
  console.log(`✅ Final insights URL: ${url.replace(token, 'REDACTED_TOKEN')}`);
  
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
