
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Already using last_28d, which is correct
    // Added a console log to verify at runtime
    const query = `${basicFields},insights.date_preset(last_28d){${insightFields}}`;
    console.log('[CAMPAIGN QUERY] Built query with date preset: last_28d');
    return query;
  }

  static validateAdAccountId = AccountValidator.validate;
  static formatAccountId = AccountValidator.format;
}
