
/**
 * Builder for Meta Insights API requests
 */
import { InsightFilterOptions } from './types';

export class InsightsRequestBuilder {
  // Valid date presets according to Meta API - strict list
  private static validDatePresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];

  /**
   * Strictly validate and map date presets to ensure only valid values
   */
  private static validateDatePreset(preset: string): string {
    // Log what we're validating
    console.log(`[INSIGHTS BUILDER] Validating date preset: "${preset}"`);
    
    if (!preset) {
      console.warn('[INSIGHTS BUILDER] Empty date preset provided, using maximum');
      return 'maximum';
    }
    
    // BLOCK ALL VARIATIONS of the last_28d preset
    if (preset === 'last_28d' || 
        preset.includes('28d') || 
        preset.includes('28day') ||
        preset === 'last28d') {
      console.warn(`[INSIGHTS BUILDER] Blocking known problematic date preset '${preset}', using 'maximum' instead`);
      
      // Track this replacement for debugging
      try {
        const blockLog = JSON.parse(localStorage.getItem('builder_preset_blocks') || '[]');
        blockLog.push({
          timestamp: new Date().toISOString(),
          original: preset,
          replacedWith: 'maximum',
          location: 'InsightsRequestBuilder.validateDatePreset'
        });
        localStorage.setItem('builder_preset_blocks', JSON.stringify(blockLog.slice(-30)));
      } catch (e) {
        // Ignore storage errors
      }
      
      return 'maximum';
    }

    // Direct check against valid presets
    if (this.validDatePresets.includes(preset)) {
      return preset;
    }

    // Explicit mapping of legacy values to valid Meta API values
    const mapping: Record<string, string> = {
      'last30days': 'last_30d', 
      'last7days': 'last_7d',
      'yesterday': 'yesterday',
      'today': 'today'
    };

    const mappedValue = mapping[preset];
    if (mappedValue) {
      console.log(`[INSIGHTS BUILDER] Mapping legacy date preset '${preset}' to '${mappedValue}'`);
      return mappedValue;
    }

    // Default to maximum for unrecognized values
    console.warn(`[INSIGHTS BUILDER] Unrecognized date preset: ${preset}, using default 'maximum'`);
    
    // Log this replacement for debugging
    try {
      const unrecognizedLog = JSON.parse(localStorage.getItem('unrecognized_date_presets') || '[]');
      unrecognizedLog.push({
        timestamp: new Date().toISOString(),
        unrecognized: preset,
        replacedWith: 'maximum',
        location: 'InsightsRequestBuilder.validateDatePreset'
      });
      localStorage.setItem('unrecognized_date_presets', JSON.stringify(unrecognizedLog.slice(-30)));
    } catch (e) {
      // Ignore storage errors
    }
    
    return 'maximum';
  }

  /**
   * Build query parameters for insights requests
   */
  public static buildQueryParams(token: string, options: InsightFilterOptions): URLSearchParams {
    const params = new URLSearchParams();
    
    // Handle date parameters (mutual exclusion between timeRange and datePreset)
    if (options.timeRange) {
      params.append('time_range', JSON.stringify(options.timeRange));
      console.log(`[INSIGHTS BUILDER] Using time_range: ${JSON.stringify(options.timeRange)}`);
    } else if (options.datePreset) {
      // Validate date preset
      const originalDatePreset = options.datePreset;
      const validDatePreset = this.validateDatePreset(options.datePreset);
      
      // Final check for last_28d in case validation somehow failed
      if (validDatePreset === 'last_28d') {
        console.error(`[INSIGHTS BUILDER] CRITICAL: Validation returned last_28d! Forcing to maximum instead.`);
        params.append('date_preset', 'maximum');
        
        // Log this critical failure
        try {
          const criticalFailures = JSON.parse(localStorage.getItem('critical_validation_failures') || '[]');
          criticalFailures.push({
            timestamp: new Date().toISOString(),
            original: originalDatePreset,
            validatedTo: validDatePreset,
            forcedTo: 'maximum',
            location: 'InsightsRequestBuilder.buildQueryParams'
          });
          localStorage.setItem('critical_validation_failures', JSON.stringify(criticalFailures.slice(-30)));
        } catch (e) {
          // Ignore storage errors
        }
      } else {
        params.append('date_preset', validDatePreset);
      }
      
      console.log(`[INSIGHTS BUILDER] Using validated date preset: ${validDatePreset} (original: ${originalDatePreset})`);
    } else {
      // Default to maximum if no time range specified (changed from last_28d)
      params.append('date_preset', 'maximum');
      console.log('[INSIGHTS BUILDER] Using default date preset: maximum');
    }
    
    // Add fields parameter
    if (options.fields && options.fields.length > 0) {
      params.append('fields', options.fields.join(','));
    }
    
    // Add level parameter
    if (options.level) {
      params.append('level', options.level);
    }
    
    // Add filtering parameter
    if (options.filtering && options.filtering.length > 0) {
      params.append('filtering', JSON.stringify(options.filtering));
    }
    
    // Add sorting parameter
    if (options.sort) {
      params.append('sort', options.sort);
    }
    
    // Add attribution windows
    if (options.attributionWindow && options.attributionWindow.length > 0) {
      params.append('action_attribution_windows', JSON.stringify(options.attributionWindow));
    }
    
    // Add unified attribution setting
    if (options.useUnifiedAttribution !== undefined) {
      params.append('use_unified_attribution_setting', options.useUnifiedAttribution.toString());
    }
    
    // Add breakdowns
    if (options.breakdowns && options.breakdowns.length > 0) {
      params.append('breakdowns', options.breakdowns.join(','));
    }
    
    // Add limit
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    // Add token
    params.append('access_token', token);
    
    // Final safety check: ensure no last_28d made it through
    const paramsString = params.toString();
    if (paramsString.includes('last_28d')) {
      console.error(`[INSIGHTS BUILDER] CRITICAL: last_28d found in final params! Fixing before returning.`);
      params.delete('date_preset');
      params.append('date_preset', 'maximum');
      
      // Log this emergency fix
      try {
        const emergencyFixes = JSON.parse(localStorage.getItem('emergency_date_preset_fixes') || '[]');
        emergencyFixes.push({
          timestamp: new Date().toISOString(),
          originalParams: paramsString,
          location: 'InsightsRequestBuilder.buildQueryParams-finalCheck'
        });
        localStorage.setItem('emergency_date_preset_fixes', JSON.stringify(emergencyFixes.slice(-30)));
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    return params;
  }
  
  /**
   * Get default fields for insights at specified level
   */
  public static getDefaultFields(level: 'account' | 'campaign' | 'adset' | 'ad'): string[] {
    const commonFields = [
      'spend',
      'impressions',
      'reach',
      'clicks',
      'ctr',
      'cpc',
      'cpm',
      'actions',
      'cost_per_action_type'
    ];
    
    switch (level) {
      case 'account':
        return ['account_name', ...commonFields];
      case 'campaign':
        return ['campaign_name', ...commonFields, 'website_purchase_roas'];
      case 'adset':
        return ['adset_name', ...commonFields];
      case 'ad':
        return ['ad_name', ...commonFields];
      default:
        return commonFields;
    }
  }
}
