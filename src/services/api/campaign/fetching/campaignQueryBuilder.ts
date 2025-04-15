export class CampaignQueryBuilder {
  static buildCampaignQuery(): string {
    // Update date_preset from last_30_days to last_28d in insights request
    return 'id,name,status,effective_status,daily_budget,lifetime_budget,objective,created_time,updated_time,start_time,end_time,insights.date_preset(last_28d){impressions,clicks,spend,actions,cost_per_action_type}';
  }

  static validateAdAccountId(adAccountId: string): boolean {
    if (!adAccountId) {
      throw new Error('Ad Account ID is required');
    }
    
    // Validate ad account ID format
    if (!/^act_\d+$/.test(adAccountId)) {
      console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${adAccountId}`);
      throw new Error(`Invalid ad account ID format: ${adAccountId}`);
    }
    
    return true;
  }

  static formatAccountId(adAccountId: string): string {
    // Ensure the ad account ID has the proper format
    return adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  }
}
