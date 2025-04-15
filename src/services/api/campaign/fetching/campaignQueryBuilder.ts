
import { CAMPAIGN_FIELDS } from './config/queryFields';
import { AccountValidator } from './utils/accountValidator';

export class CampaignQueryBuilder {
  static buildCampaignQuery(): string {
    const basicFields = CAMPAIGN_FIELDS.BASIC.join(',');
    const insightFields = CAMPAIGN_FIELDS.INSIGHTS.join(',');
    
    return `${basicFields},insights.date_preset(last_28d){${insightFields}}`;
  }

  static validateAdAccountId = AccountValidator.validate;
  static formatAccountId = AccountValidator.format;
}
