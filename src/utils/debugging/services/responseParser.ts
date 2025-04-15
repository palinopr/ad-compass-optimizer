
import { CampaignFetchLog } from '../types/campaignLogTypes';
import { parseDatePreset } from './parsers/datePresetParser';
import { parseCampaignPreviews, hasInsightsData } from './parsers/campaignPreviewParser';
import { parseResponseBody } from './parsers/responseBodyParser';
import { parseMetaError } from './parsers/errorParser';

class ResponseParser {
  static async parseResponse(response: Response, accountId: string, queryParams?: string): Promise<Partial<CampaignFetchLog>> {
    // Store full request details
    const requestDetails = {
      url: response.url,
      method: response.method,
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
      statusText: response.statusText
    };

    console.log('[CAMPAIGN FETCH] Request details:', {
      ...requestDetails,
      url: response.url.replace(/access_token=([^&]+)/, 'access_token=REDACTED')
    });

    const { text: responseText, error: parsedError } = await parseResponseBody(response);
    let parsedJson;
    let campaignPreviews = [];
    let error;
    
    try {
      parsedJson = JSON.parse(responseText);
      
      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        campaignPreviews = parseCampaignPreviews(parsedJson.data);
      }
      
      // Enhanced error handling
      if (!response.ok || parsedJson.error) {
        error = parseMetaError({
          ...parsedJson.error || parsedError,
          status: response.status,
          requestUrl: response.url,
          rawResponse: responseText,
          httpStatus: response.status,
          rateLimitInfo: response.headers.get('x-business-use-case-usage') || 
                        response.headers.get('x-app-usage')
        });
      }
    } catch (err) {
      console.error('[CAMPAIGN FETCH] Failed to parse response:', err);
      error = parseMetaError({
        message: 'Failed to parse API response',
        code: 'PARSE_ERROR',
        type: 'ClientError',
        rawResponse: responseText,
        originalError: err
      });
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
      requestTimestamp: new Date().toISOString(),
      requestDetails // Include full request details
    };
  }
}

export default ResponseParser;
