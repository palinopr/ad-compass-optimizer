
import { CampaignFetchLog } from '../types/campaignLogTypes';
import { parseDatePreset } from './parsers/datePresetParser';
import { parseCampaignPreviews, hasInsightsData } from './parsers/campaignPreviewParser';
import { parseResponseBody } from './parsers/responseBodyParser';

class ResponseParser {
  static async parseResponse(response: Response, accountId: string, queryParams?: string): Promise<Partial<CampaignFetchLog>> {
    const responseText = await parseResponseBody(response);
    let parsedJson;
    let campaignPreviews = [];
    
    try {
      parsedJson = JSON.parse(responseText);
      
      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        campaignPreviews = parseCampaignPreviews(parsedJson.data);
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
      insightsData: parsedJson?.data ? hasInsightsData(parsedJson.data) : false,
      datePreset: parseDatePreset(queryParams),
      queryParams,
      campaignPreviews
    };
  }
}

export default ResponseParser;
