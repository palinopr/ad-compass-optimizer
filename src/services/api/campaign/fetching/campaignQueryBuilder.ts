
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  // Valid date presets according to Meta API documentation - strict list
  private static validDatePresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];

  static buildCampaignQuery(datePreset = 'maximum'): string {
    // Map legacy presets to Meta API compatible presets
    let validDatePreset = this.normalizePreset(datePreset);
    
    // Use a more comprehensive list of fields to ensure we get all required data
    // We're explicitly requesting these fields as required by the user
    const basicFields = 'id,name,status,effective_status,daily_budget,lifetime_budget,objective,created_time,updated_time,start_time,end_time,stop_time';
    
    // Build a clean insights field string with the validated date preset
    // This format was proven to work in previous fixes
    const insightFields = 'impressions,clicks,spend,actions,cost_per_action_type,website_purchase_roas';
    
    // Build query with the validated date preset using simplified structure
    const query = `${basicFields}&insights.date_preset(${validDatePreset}).fields(${insightFields})`;
    
    // Log the query for debugging
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${validDatePreset}`);
    console.log(`[CAMPAIGN QUERY] Full query fields: ${query}`);
    
    return query;
  }

  // Map legacy or invalid presets to valid Meta API presets
  static normalizePreset(datePreset: string): string {
    if (!datePreset) return 'maximum';

    // Direct matching against valid presets
    if (this.validDatePresets.includes(datePreset)) {
      return datePreset;
    }

    // Direct mapping for legacy presets
    const legacyMapping: Record<string, string> = {
      'last30days': 'last_30d',
      'last_28d': 'maximum',
      'last28d': 'maximum',
      'last7days': 'last_7d'
    };

    if (legacyMapping[datePreset]) {
      console.log(`[CAMPAIGN QUERY] Mapping legacy preset '${datePreset}' to '${legacyMapping[datePreset]}'`);
      return legacyMapping[datePreset];
    }

    // Fall back to maximum for unrecognized presets
    console.warn(`[CAMPAIGN QUERY] Unrecognized date preset: ${datePreset}, using default 'maximum'`);
    return 'maximum';
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    // Increment version to force cache invalidation
    return '1.0.9-strict-date-preset-validation';
  }
  
  // Adding timestamp to ensure no cache is used
  static getBuildTimestamp(): string {
    return new Date().toISOString();
  }

  static validateAdAccountId(adAccountId: string): boolean {
    if (!adAccountId) {
      throw new Error('Ad Account ID is required');
    }
    return AccountValidator.validate(adAccountId);
  }
  
  static formatAccountId(adAccountId: string): string {
    return AccountValidator.format(adAccountId);
  }
  
  // Force rebuild by including unused function that will be different on every build
  static forceRebuild(): string {
    return `rebuild-${Date.now()}-${Math.random()}`;
  }
  
  // Add a function to verify that the correct date preset is being used
  static verifyDatePreset(query: string): boolean {
    const match = query.match(/date_preset\(([^)]+)\)/);
    if (!match) {
      console.error('[CAMPAIGN QUERY] No date preset found in query!');
      return false;
    }
    
    const foundPreset = match[1];
    
    if (!this.validDatePresets.includes(foundPreset)) {
      console.error(`[CAMPAIGN QUERY] Invalid date preset found: ${foundPreset}`);
      return false;
    }
    
    console.log(`[CAMPAIGN QUERY] ✅ Verified correct date preset: ${foundPreset}`);
    return true;
  }
}
