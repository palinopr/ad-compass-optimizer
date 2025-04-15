
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  static buildCampaignQuery(datePreset = 'last_28d'): string {
    // Use the defined fields from config
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Use the provided date preset (default to last_28d if not specified)
    const query = `${basicFields},insights.date_preset(${datePreset}){${insightFields}}`;
    
    // Log the query for debugging
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${datePreset}`);
    console.log(`[CAMPAIGN QUERY] Full query string: ${query}`);
    
    return query;
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    // Increment version to force cache invalidation
    return '1.0.6-insights-fields';
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
    const validPresets = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 
                        'last_3_months', 'last_6_months', 'this_quarter', 'lifetime', 
                        'last_30d', 'last_14d', 'last_7d', 'last_28d'];
    
    if (!validPresets.includes(foundPreset)) {
      console.error(`[CAMPAIGN QUERY] Invalid date preset found: ${foundPreset}`);
      return false;
    }
    
    console.log(`[CAMPAIGN QUERY] ✅ Verified correct date preset: ${foundPreset}`);
    return true;
  }
}
