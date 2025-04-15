
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
      
      // Store raw campaign response for debugging
      try {
        localStorage.setItem('raw_campaign_response', JSON.stringify({
          data: parsedJson.data?.slice(0, 2), // Store just a couple campaigns to avoid huge storage
          paging: parsedJson.paging,
          responseStatus: response.status,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error storing raw response:', e);
      }
      
      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        console.log(`[CAMPAIGN FETCH] Response contains ${parsedJson.data.length} campaigns`);
        campaignPreviews = parseCampaignPreviews(parsedJson.data);
        
        // Detailed analysis of insights data presence
        const insightsStats = {
          total: parsedJson.data.length,
          withInsights: parsedJson.data.filter(c => !!c.insights).length,
          withoutInsights: parsedJson.data.filter(c => !c.insights).length,
          insightsSamples: parsedJson.data.slice(0, 2).map(c => ({
            id: c.id,
            hasInsights: !!c.insights,
            insightsKeys: c.insights ? Object.keys(c.insights) : []
          }))
        };
        console.log('[CAMPAIGN FETCH] Insights data analysis:', insightsStats);
      }
      
      // Enhanced error handling
      if (!response.ok || parsedJson.error) {
        console.error('[CAMPAIGN FETCH FAILED]', {
          status: response.status,
          statusText: response.statusText,
          error: parsedJson.error || 'Unknown error',
          rawResponse: responseText.substring(0, 500) // Log first 500 chars to avoid massive logs
        });
        
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
      requestDetails
    };
  }
}

export default ResponseParser;
