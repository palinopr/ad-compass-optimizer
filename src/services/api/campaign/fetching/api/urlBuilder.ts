
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
    // CRITICAL: Verify the fields parameter is present and not empty
    if (!fieldsQuery || fieldsQuery.trim() === '') {
      const error = '[CAMPAIGN FETCH] Error: Empty fields parameter in campaign request URL';
      console.error(error);
      throw new Error(error);
    }

    // Ensure fieldsQuery starts with "fields=" if it doesn't already
    const fieldsParam = fieldsQuery.startsWith('fields=') ? fieldsQuery : `fields=${fieldsQuery}`;
    
    // Build the URL with validated fields parameter
    const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?${fieldsParam}&limit=500&access_token=${token}`;
    
    // Log the full URL (with token redacted) to verify correct format
    const redactedUrl = url.replace(token, 'REDACTED');
    console.log(`[CAMPAIGN FETCH] Full URL structure (redacted): ${redactedUrl}`);
    
    // Verify URL contains fields parameter
    if (!url.includes('fields=')) {
      const error = '[CAMPAIGN FETCH] Error: Missing fields parameter in campaign request URL';
      console.error(error);
      throw new Error(error);
    }
    
    return url;
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

    // Use the provided date preset or default to maximum
    const fieldsQuery = CampaignQueryBuilder.buildCampaignQuery(datePreset || 'maximum');
    
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
      localStorage.setItem('last_campaign_request_date_preset', datePreset || 'maximum');
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error storing request info:', e);
    }

    return { url, formattedAccountId };
  }
}
