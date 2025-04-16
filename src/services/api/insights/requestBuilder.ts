
/**
 * Builder for Meta Insights API requests
 */
import { InsightFilterOptions } from './types';

export class InsightsRequestBuilder {
  // Valid date presets according to Meta API - strict list
  private static validDatePresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_28d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];

  /**
   * Strictly validate and map date presets to ensure only valid values
   */
  private static validateDatePreset(preset: string): string {
    if (!preset) return 'maximum'; // Changed default to 'maximum' which is more reliable

    // Direct check against valid presets
    if (this.validDatePresets.includes(preset)) {
      // Special case - last_28d has caused issues with some accounts
      if (preset === 'last_28d') {
        console.warn(`[INSIGHTS] Potentially problematic date preset 'last_28d' detected, using 'maximum' instead`);
        return 'maximum';
      }
      return preset;
    }

    // Explicit mapping of legacy values to valid Meta API values
    const mapping: Record<string, string> = {
      'last30days': 'maximum', // Changed from last_28d to maximum
      'last_30d': 'maximum',   // Changed from last_28d to maximum 
      'last7days': 'last_7d'
    };

    const mappedValue = mapping[preset];
    if (mappedValue) {
      console.log(`[INSIGHTS] Mapping legacy date preset '${preset}' to '${mappedValue}'`);
      return mappedValue;
    }

    // Default to maximum for unrecognized values
    console.warn(`[INSIGHTS] Unrecognized date preset: ${preset}, using default 'maximum'`);
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
    } else if (options.datePreset) {
      // Validate date preset
      const validDatePreset = this.validateDatePreset(options.datePreset);
      params.append('date_preset', validDatePreset);
      console.log(`[INSIGHTS] Using validated date preset: ${validDatePreset} (original: ${options.datePreset})`);
    } else {
      // Default to maximum if no time range specified (changed from last_28d)
      params.append('date_preset', 'maximum');
      console.log('[INSIGHTS] Using default date preset: maximum');
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
