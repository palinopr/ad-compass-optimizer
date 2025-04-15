
import { MetaCampaign } from '../../types/metaCampaignTypes';

export class CampaignProcessor {
  static processCampaigns(campaigns: any[]): MetaCampaign[] {
    return campaigns.map((campaign: any) => {
      let budget = '-';
      if (campaign.daily_budget) {
        budget = `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day`;
      } else if (campaign.lifetime_budget) {
        budget = `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} total`;
      }
      
      // Default values for metrics to ensure UI always has values to display
      let results = '0';
      let spend = '$0.00';
      let impressions = '0';
      let clicks = '0';
      let cpa = '-';
      
      // Process insights data if available, but don't block if missing
      if (campaign.insights && campaign.insights.data && campaign.insights.data.length > 0) {
        const insightData = campaign.insights.data[0];
        
        // Format impressions with commas
        if (insightData.impressions) {
          const impressionsVal = parseInt(insightData.impressions);
          impressions = impressionsVal.toLocaleString();
        }
        
        // Format clicks with commas
        if (insightData.clicks) {
          const clicksVal = parseInt(insightData.clicks);
          clicks = clicksVal.toLocaleString();
        }
        
        // Format spend as currency
        if (insightData.spend) {
          const spendVal = parseFloat(insightData.spend);
          spend = `$${spendVal.toFixed(2)}`;
        }
        
        // Calculate CPA
        const purchaseCpa = insightData.cost_per_action_type?.find(
          (item: any) => item.action_type === 'purchase'
        );
        if (purchaseCpa) {
          cpa = `$${parseFloat(purchaseCpa.value).toFixed(2)}`;
        }
        
        // Calculate results (purchases)
        const purchaseAction = insightData.actions?.find(
          (action: any) => action.action_type === 'purchase'
        );
        if (purchaseAction) {
          results = purchaseAction.value;
        }
      }
      
      // Always ensure insights object exists with default values
      const insights = {
        impressions: impressions || '0',
        clicks: clicks || '0',
        spend: spend || '$0.00',
        cpa: cpa || '-',
        actions: campaign.insights?.data?.[0]?.actions || [],
        cost_per_action_type: campaign.insights?.data?.[0]?.cost_per_action_type || []
      };
      
      return {
        ...campaign,
        budget,
        results,
        spend,
        insights
      };
    });
  }
}
