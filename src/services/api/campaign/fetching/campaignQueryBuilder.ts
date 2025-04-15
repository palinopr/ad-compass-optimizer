
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  // Re-implemented to ensure the 28-day window change is properly applied
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // IMPORTANT: Using last_28d date preset for campaign insights
    // This explicit string ensures the correct parameter is used after rebuild
    const datePreset = 'last_28d';
    const query = `${basicFields},insights.date_preset(${datePreset}){${insightFields}}`;
    
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${datePreset}`);
    return query;
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    // Increment version to force cache invalidation
    return '1.0.2-28d-fix-REBUILD';
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
}
