
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  // Re-implemented to ensure the 28-day window change is properly applied
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Always explicitly use last_28d date preset for campaign insights
    // This ensures consistent usage throughout the application
    const datePreset = 'last_28d';
    const query = `${basicFields},insights.date_preset(${datePreset}){${insightFields}}`;
    
    // Force log the parameter usage to ensure it's visible in console
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${datePreset}`);
    console.log(`[CAMPAIGN QUERY] Full query string: ${query}`);
    
    return query;
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    // Increment version to force cache invalidation
    return '1.0.3-28d-fix-REBUILD';
  }
  
  // Adding timestamp to ensure no cache is used
  static getBuildTimestamp(): string {
    return new Date().toISOString();
  }

  static validateAdAccountId = AccountValidator.validate;
  static formatAccountId = AccountValidator.format;
  
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
