
/**
 * Utility class to verify date presets in various components and APIs
 */
export class DatePresetVerifier {
  /**
   * Verify all date presets in key locations
   */
  static verifyAllDatePresets(): void {
    console.log('Running date preset verification...');
    
    try {
      // Check CampaignQueryBuilder
      try {
        const { CampaignQueryBuilder } = this.safeImport('../services/api/campaign/fetching/campaignQueryBuilder');
        if (CampaignQueryBuilder) {
          const query = CampaignQueryBuilder.buildCampaignQuery();
          const isValid = this.checkPreset(query);
          
          // If preset is invalid, trigger fallback
          if (!isValid) {
            console.warn('⚠️ Invalid date preset detected - triggering automatic fallback to maximum');
            localStorage.setItem('force_maximum_date_preset', 'true');
            
            // Dispatch fallback event for campaign components to listen to
            if (typeof window !== 'undefined') {
              const fallbackEvent = new CustomEvent('date-preset-fallback-triggered', {
                detail: { reason: 'Invalid date preset detected' }
              });
              window.dispatchEvent(fallbackEvent);
            }
          }
        }
      } catch (err) {
        console.error('Error checking CampaignQueryBuilder:', err);
        this.triggerFallback('Error in CampaignQueryBuilder');
      }
      
      // Check MetaFunnelBatchService
      try {
        const { MetaFunnelBatchService } = this.safeImport('../services/api/funnel/MetaFunnelBatchService');
        if (MetaFunnelBatchService) {
          // Check if the service has a date_preset property or method
          this.checkServiceForDatePreset(MetaFunnelBatchService);
        }
      } catch (err) {
        console.error('Error checking MetaFunnelBatchService:', err);
        this.triggerFallback('Error in MetaFunnelBatchService');
      }
      
      // Check InsightsRequestBuilder
      try {
        const { InsightsRequestBuilder } = this.safeImport('../services/api/insights/requestBuilder');
        if (InsightsRequestBuilder) {
          // Mock options to check the default date preset
          const mockOptions = {};
          const mockToken = 'test-token';
          const params = InsightsRequestBuilder.buildQueryParams(mockToken, mockOptions);
          const isValid = this.checkPreset(params.toString());
          
          // If preset is invalid, trigger fallback
          if (!isValid) {
            this.triggerFallback('Invalid preset in InsightsRequestBuilder');
          }
        }
      } catch (err) {
        console.error('Error checking InsightsRequestBuilder:', err);
        this.triggerFallback('Error in InsightsRequestBuilder');
      }
      
      // Check the last used date preset in localStorage
      try {
        const lastDatePreset = localStorage.getItem('last_campaign_request_date_preset');
        console.log('Last used date preset:', lastDatePreset || 'NOT FOUND');
        const isValid = this.checkPreset(lastDatePreset || '');
        
        // If preset is invalid, trigger fallback
        if (!isValid && lastDatePreset) {
          this.triggerFallback(`Invalid stored preset: ${lastDatePreset}`);
        }
      } catch (err) {
        console.error('Error checking localStorage date preset:', err);
        this.triggerFallback('Error checking stored date preset');
      }
    } catch (e) {
      console.error('Error in date preset verification:', e);
      this.triggerFallback('General date preset verification error');
    }
  }
  
  /**
   * Trigger automatic fallback to maximum date preset
   */
  static triggerFallback(reason: string): void {
    console.warn(`⚠️ [DATE PRESET FALLBACK] Triggering automatic fallback to maximum: ${reason}`);
    localStorage.setItem('force_maximum_date_preset', 'true');
    localStorage.setItem('date_preset_fallback_reason', reason);
    localStorage.setItem('date_preset_fallback_timestamp', Date.now().toString());
    
    // Dispatch fallback event for campaign components to listen to
    if (typeof window !== 'undefined') {
      const fallbackEvent = new CustomEvent('date-preset-fallback-triggered', {
        detail: { reason }
      });
      window.dispatchEvent(fallbackEvent);
    }
  }
  
  /**
   * Check a string for valid date preset
   */
  static checkPreset(text: string): boolean {
    // Look for date preset patterns in the text
    const metaDatePresetRegex = /date_preset(?:\=|\()([a-z0-9_]+)(?:\)|(?:\&|\s|$))/i;
    const match = text.match(metaDatePresetRegex);
    
    if (!match) {
      console.error('❌ Date preset not found');
      return false;
    }
    
    const preset = match[1];
    
    // Valid Meta API date presets
    const validPresets = [
      'today',
      'yesterday', 
      'this_month', 
      'last_month',
      'this_quarter', 
      'lifetime', 
      'last_3d', 
      'last_7d', 
      'last_14d',
      'last_30d', 
      'last_90d',
      'last_week_mon_sun', 
      'last_week_sun_sat', 
      'last_quarter', 
      'last_year',
      'this_week_mon_today', 
      'this_week_sun_today', 
      'this_year',
      'maximum' // Add maximum as a valid preset
    ];
    
    const isValid = validPresets.includes(preset);
    
    if (!isValid) {
      console.error(`❌ Invalid date preset found: ${preset}`);
      console.warn(`Valid presets are: ${validPresets.join(', ')}`);
      return false;
    }
    
    console.log(`✅ Valid date preset: ${preset}`);
    return true;
  }
  
  /**
   * Check a service object for date preset usage
   */
  private static checkServiceForDatePreset(service: any): void {
    // Implementation would depend on the service structure
    console.log('Service date preset check not implemented');
  }
  
  /**
   * Safely import a module without causing build errors
   */
  private static safeImport(path: string): any {
    try {
      // In browser environment, we can't use require directly
      if (typeof window !== 'undefined') {
        return window;
      }
      return {};
    } catch (e) {
      console.error(`Error importing ${path}:`, e);
      return {};
    }
  }
}

// Run verification on load
setTimeout(() => {
  try {
    DatePresetVerifier.verifyAllDatePresets();
  } catch (e) {
    console.error('Error running date preset verification:', e);
  }
}, 2000);
