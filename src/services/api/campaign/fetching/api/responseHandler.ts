
import { PaginationHandler } from '../paginationHandler';

export class ResponseHandler {
  /**
   * Processes a successful API response, handling pagination if needed
   */
  public static async processCampaignResponse(data: any): Promise<any[]> {
    if (!data || !data.data || !Array.isArray(data.data)) {
      return [];
    }

    let allCampaigns = [...data.data];
    
    // Handle pagination if present
    if (data.paging && data.paging.next) {
      console.log('[CAMPAIGN FETCH] Pagination detected, fetching more pages');
      try {
        const nextPageCampaigns = await PaginationHandler.fetchPaginatedCampaigns(data.paging.next);
        allCampaigns = [...allCampaigns, ...nextPageCampaigns];
      } catch (paginationError) {
        console.error('[CAMPAIGN FETCH] Error fetching additional pages:', paginationError);
      }
    }
    
    console.log(`[CAMPAIGN FETCH] Successfully fetched ${allCampaigns.length} campaigns`);
      
    // Mark successful fetch in localStorage
    localStorage.setItem('last_campaign_fetch_success', 'true');
    localStorage.setItem('last_campaign_count', String(allCampaigns.length));
    localStorage.setItem('last_campaign_fetch_completed', new Date().toISOString());
    
    if (allCampaigns.length > 0) {
      localStorage.setItem('has_campaigns_data', 'true');
    } else {
      localStorage.setItem('has_campaigns_data', 'false');
      localStorage.setItem('empty_campaigns_response', 'true');
    }
    
    return allCampaigns;
  }
}
