
import { INSIGHTS_HEADERS } from '../constants';
import { buildInsightsUrl } from '../insightsUrlBuilder';
import { InsightsThrottling } from '@/services/api/insights/throttling/InsightsThrottling';
import { processInsightsData } from '../insightsProcessor';
import { validateDatePreset } from '../datePresetValidator';
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { delay, insightsQueueState, requestedCampaignIds, insightsThrottlingState } from '../batchConfig';

export const fetchCampaignInsightData = async (
  campaignId: string,
  token: string,
  datePreset: string = 'last_30d'
): Promise<CampaignExtraStats | null> => {
  // Check if global throttling is active
  if (insightsThrottlingState.isActiveThrottling()) {
    console.log(`[INSIGHTS FETCH] Skipping fetch for campaign ${campaignId}: global throttling is active`);
    return null;
  }
  
  // Check if global queue is locked
  if (insightsQueueState.isActiveLock()) {
    console.log(`[INSIGHTS FETCH] Skipping fetch for campaign ${campaignId}: global queue is locked`);
    return null;
  }
  
  // First check if we've already fetched this campaign in this session
  if (requestedCampaignIds.has(campaignId)) {
    console.log(`[INSIGHTS FETCH] Skipping duplicate fetch for campaign ${campaignId}`);
    return null;
  }
  
  // Mark this campaign as requested
  requestedCampaignIds.add(campaignId);
  
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
  
  try {
    // IMPROVED: Use proper async/await pattern for fetch to ensure sequential execution
    console.log(`[INSIGHTS FETCH] Executing fetch for campaign ${campaignId}...`);
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
    console.log(`[INSIGHTS FETCH] Successfully fetched insights for campaign ${campaignId}`);
    await delay(50); // Small delay to ensure log entry is complete
    
    return processInsightsData(insightsData);
  } catch (error) {
    console.error(`[INSIGHTS FETCH] Exception in fetch for campaign ${campaignId}:`, error);
    InsightsThrottling.checkErrorForRateLimit(error);
    throw error;
  }
};

