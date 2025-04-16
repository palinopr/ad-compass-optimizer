
import { CampaignApiClient } from './api/campaignApiClient';

export class PaginationHandler {
  static async fetchPaginatedCampaigns(nextPageUrl: string): Promise<any[]> {
    try {
      // Remove access token from URL for logging
      console.log(`[CAMPAIGN FETCH] Fetching next page: ${nextPageUrl.replace(/access_token=([^&]+)/, 'access_token=REDACTED')}`);
      
      const response = await fetch(nextPageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid pagination response format');
      }
      
      let campaigns = [...data.data];
      
      // Check if there's another page
      if (data.paging && data.paging.next) {
        const moreCampaigns = await this.fetchPaginatedCampaigns(data.paging.next);
        campaigns = [...campaigns, ...moreCampaigns];
      }
      
      return campaigns;
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Pagination error:', error);
      throw error;
    }
  }
}
