/**
 * Builder for Meta Insights API requests
 */
import { InsightFilterOptions } from './types';

export class InsightsRequestBuilder {
  /**
   * Build query parameters for insights requests
   */
  public static buildQueryParams(token: string, options: InsightFilterOptions): URLSearchParams {
    const params = new URLSearchParams();
    
    // Handle date parameters (mutual exclusion between timeRange and datePreset)
    if (options.timeRange) {
      params.append('time_range', JSON.stringify(options.timeRange));
    } else if (options.datePreset) {
      // Ensure we always use last_28d when last_30d or last30days was provided
      let datePreset = options.datePreset;
      if (datePreset === 'last_30d' || datePreset === 'last30days') {
        console.log(`[INSIGHTS] Converting legacy date preset "${datePreset}" to "last_28d"`);
        datePreset = 'last_28d';
      }
      params.append('date_preset', datePreset);
    } else {
      // Default to last_28d if no time range specified (updated from last_30d)
      params.append('date_preset', 'last_28d');
      console.log('[INSIGHTS] Using default date preset: last_28d');
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
