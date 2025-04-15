
import { CampaignFetchLog, CampaignPreview } from '../types/campaignLogTypes';

class ResponseParser {
  static async parseResponse(response: Response, accountId: string, queryParams?: string): Promise<Partial<CampaignFetchLog>> {
    const responseText = await response.clone().text();
    let parsedJson;
    let hasInsights = false;
    let campaignPreviews: CampaignPreview[] = [];
    let datePreset = '';

    try {
      parsedJson = JSON.parse(responseText);
      
      if (queryParams) {
        const datePresetMatch = queryParams.match(/date_preset=([^&]+)/);
        if (datePresetMatch) {
          datePreset = datePresetMatch[1];
        }
      }
      
      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        campaignPreviews = parsedJson.data.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          spend: campaign.spend || '$0.00',
          results: campaign.results || '0'
        }));

        hasInsights = parsedJson.data.some(
          (campaign: any) => campaign.insights && campaign.insights.data && campaign.insights.data.length > 0
        );
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
      insightsData: hasInsights,
      datePreset,
      queryParams,
      campaignPreviews
    };
  }
}

export default ResponseParser;
