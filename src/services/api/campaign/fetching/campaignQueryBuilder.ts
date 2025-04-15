
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  // Re-implemented to ensure the 28-day window change is properly applied
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Using last_28d date preset for campaign insights
    const datePreset = 'last_28d';
    const query = `${basicFields},insights.date_preset(${datePreset}){${insightFields}}`;
    
    console.log(`[CAMPAIGN QUERY] Built query with date preset: ${datePreset}`);
    return query;
  }

  // Adding version tracking to help identify when this code is deployed
  static getVersion(): string {
    return '1.0.1-28d-fix';
  }

  static validateAdAccountId = AccountValidator.validate;
  static formatAccountId = AccountValidator.format;
}
