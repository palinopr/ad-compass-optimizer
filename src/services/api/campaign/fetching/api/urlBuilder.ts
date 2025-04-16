
import { CampaignQueryBuilder } from '../campaignQueryBuilder';
import { BaseApiService } from '../../../BaseApiService';

export class CampaignUrlBuilder extends BaseApiService {
  /**
   * Builds a properly formatted URL for the Meta API campaign request
   */
  public static buildCampaignFetchUrl(
    formattedAccountId: string, 
    fieldsQuery: string, 
    token: string
  ): string {
    // Build URL - IMPORTANT: Use fields= for the first part, then append the rest
    // This structure mimics the successful format from previous fixes
    return `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=${fieldsQuery}&limit=500&access_token=${token}`;
  }
  
  /**
   * Builds a validated campaign request URL with proper logging
   */
  public static prepareUrlWithValidation(
    token: string, 
    adAccountId: string, 
    datePreset?: string
  ): { url: string; formattedAccountId: string } {
    CampaignQueryBuilder.validateAdAccountId(adAccountId);
    const formattedAccountId = CampaignQueryBuilder.formatAccountId(adAccountId);
    console.log(`[CAMPAIGN FETCH] Using formatted account ID: ${formattedAccountId}`);

    // Use the provided date preset or default to last_28d
    // CampaignQueryBuilder.normalizePreset will validate/map the preset
    const fieldsQuery = CampaignQueryBuilder.buildCampaignQuery(datePreset || 'last_28d');
    
    // Verify that the date preset is valid
    CampaignQueryBuilder.verifyDatePreset(fieldsQuery);
    
    console.log('[CAMPAIGN FETCH] Using query fields:', fieldsQuery);

    // Build the URL
    const url = this.buildCampaignFetchUrl(formattedAccountId, fieldsQuery, token);
    
    // Log the actual URL that will be used (with token redacted)
    const redactedUrl = url.replace(token, 'REDACTED');
    console.log(`[CAMPAIGN FETCH] Request URL: ${redactedUrl}`);
    
    // Store the URL for debugging
    try {
      localStorage.setItem('last_campaign_request_url', redactedUrl);
      localStorage.setItem('last_campaign_request_timestamp', new Date().toISOString());
      localStorage.setItem('last_campaign_request_date_preset', datePreset || 'last_28d');
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error storing request info:', e);
    }

    return { url, formattedAccountId };
  }
}
