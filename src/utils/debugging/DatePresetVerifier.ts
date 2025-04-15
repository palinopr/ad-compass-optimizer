
/**
 * Utility class to verify date preset across the application
 */
export class DatePresetVerifier {
  /**
   * Verify all campaign related API calls use last_28d
   */
  public static verifyAllDatePresets(): void {
    console.group('🧪 DATE PRESET VERIFICATION');
    
    // Check CampaignQueryBuilder
    try {
      const { CampaignQueryBuilder } = require('@/services/api/campaign/fetching/campaignQueryBuilder');
      const campaignQuery = CampaignQueryBuilder.buildCampaignQuery();
      const campaignPreset = campaignQuery.match(/date_preset\(([^)]+)\)/)?.[1];
      
      console.log(`CampaignQueryBuilder preset: ${campaignPreset || 'NOT FOUND'}`);
      this.checkPreset(campaignPreset);
    } catch (e) {
      console.error('Error checking CampaignQueryBuilder:', e);
    }
    
    // Check MetaFunnelBatchService
    try {
      const { MetaFunnelBatchService } = require('@/services/api/funnel/MetaFunnelBatchService');
      const batchRequests = MetaFunnelBatchService.buildBatchRequests('act_123');
      const campaignsRequest = batchRequests[0];
      const batchPreset = campaignsRequest.relative_url.match(/date_preset\(([^)]+)\)/)?.[1];
      
      console.log(`MetaFunnelBatchService preset: ${batchPreset || 'NOT FOUND'}`);
      this.checkPreset(batchPreset);
    } catch (e) {
      console.error('Error checking MetaFunnelBatchService:', e);
    }
    
    // Check InsightsRequestBuilder defaults
    try {
      const { InsightsRequestBuilder } = require('@/services/api/insights/requestBuilder');
      const params = InsightsRequestBuilder.buildQueryParams('token', {});
      const insightsPreset = params.get('date_preset');
      
      console.log(`InsightsRequestBuilder preset: ${insightsPreset || 'NOT FOUND'}`);
      this.checkPreset(insightsPreset);
    } catch (e) {
      console.error('Error checking InsightsRequestBuilder:', e);
    }
    
    // Check localstorage for cached values
    try {
      const savedPreset = localStorage.getItem('last_campaign_request_date_preset');
      console.log(`Last used date preset: ${savedPreset || 'NOT FOUND'}`);
      this.checkPreset(savedPreset);
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
    
    console.groupEnd();
  }
  
  private static checkPreset(preset: string | null | undefined): void {
    if (!preset) {
      console.error('❌ Date preset not found');
      return;
    }
    
    if (preset === 'last_28d') {
      console.log('✅ Correct date preset: last_28d');
    } else if (preset === 'last_30d' || preset === 'last30days' || preset === 'last_30_days') {
      console.error(`❌ Incorrect date preset: ${preset} - should be last_28d`);
    } else {
      console.warn(`⚠️ Unexpected date preset: ${preset} - expected last_28d`);
    }
  }
  
  public static verifyOnLoad(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          console.log('Running date preset verification...');
          this.verifyAllDatePresets();
        }, 2000);
      });
    }
  }
}

// Auto-initialize verification if not in production
if (process.env.NODE_ENV !== 'production') {
  DatePresetVerifier.verifyOnLoad();
}
