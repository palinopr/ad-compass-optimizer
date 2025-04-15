
import { CampaignFetchLog } from '../types/campaignLogTypes';
import { parseDatePreset } from './parsers/datePresetParser';
import { parseCampaignPreviews, hasInsightsData } from './parsers/campaignPreviewParser';
import { parseResponseBody } from './parsers/responseBodyParser';
import { parseMetaError } from './parsers/errorParser';

class ResponseParser {
  static async parseResponse(response: Response, accountId: string, queryParams?: string): Promise<Partial<CampaignFetchLog>> {
    const { text: responseText, error: parsedError } = await parseResponseBody(response);
    let parsedJson;
    let campaignPreviews = [];
    let error;
    
    try {
      parsedJson = JSON.parse(responseText);
      
      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        campaignPreviews = parseCampaignPreviews(parsedJson.data);
      }
      
      if (!response.ok && parsedError) {
        error = parseMetaError(parsedError);
      }
    } catch (err) {
      console.error('[CAMPAIGN FETCH] ❌ Failed to parse JSON:', err);
    }

    return {
      timestamp: new Date().toISOString(),
      accountId,
      status: response.status,
      statusText: response.statusText,
      responseBody: responseText,
      parsedJson,
      error,
      insightsData: parsedJson?.data ? hasInsightsData(parsedJson.data) : false,
      datePreset: parseDatePreset(queryParams),
      queryParams,
      campaignPreviews,
      requestTimestamp: new Date().toISOString()
    };
  }
}

export default ResponseParser;
