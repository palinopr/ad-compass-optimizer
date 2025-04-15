
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  // Updated comment to trigger rebuild and emphasize last_28d fix
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    // Confirmed last_28d date preset for comprehensive campaign insights
    const query = `${basicFields},insights.date_preset(last_28d){${insightFields}}`;
    console.log('[CAMPAIGN QUERY] Built query with date preset: last_28d');
    return query;
  }

  static validateAdAccountId = AccountValidator.validate;
  static formatAccountId = AccountValidator.format;
}
