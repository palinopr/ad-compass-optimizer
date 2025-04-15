
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  static buildCampaignQuery(): string {
    // Use the defined fields from config
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Explicitly include insights block with date_preset
    const datePreset = 'last_28d';
    const query = `${basicFields},insights.date_preset(${datePreset}){${insightFields}}`;
    
    // Log the query for debugging
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${datePreset}`);
    console.log(`[CAMPAIGN QUERY] Full query string: ${query}`);
    
    return query;
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    // Increment version to force cache invalidation
    return '1.0.5-insights-fields';
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
    if (foundPreset !== 'last_28d') {
      console.error(`[CAMPAIGN QUERY] Incorrect date preset found: ${foundPreset}, should be last_28d`);
      return false;
    }
    
    console.log(`[CAMPAIGN QUERY] ✅ Verified correct date preset: ${foundPreset}`);
    return true;
  }
}
