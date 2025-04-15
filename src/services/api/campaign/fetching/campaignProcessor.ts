
import { MetaCampaign } from '../../types/metaCampaignTypes';

export class CampaignProcessor {
  static processCampaigns(campaigns: any[]): MetaCampaign[] {
    console.log(`[CAMPAIGN FETCH] Processing ${campaigns.length} campaigns`);
    
    // Analyze campaigns before returning them
    if (campaigns.length > 0) {
      // Log the first campaign as sample (redact sensitive data)
      const sampleCampaign = { ...campaigns[0] };
      console.log('[CAMPAIGN FETCH] Sample campaign structure:', 
        JSON.stringify({
          id: sampleCampaign.id,
          name: sampleCampaign.name,
          status: sampleCampaign.status,
          hasInsights: !!sampleCampaign.insights,
          insightsFields: sampleCampaign.insights ? Object.keys(sampleCampaign.insights) : [],
          datePreset: sampleCampaign.insights?.date_preset || 'missing'
        }, null, 2)
      );
      
      // Analyze insights data presence
      const insightsCount = campaigns.filter(c => !!c.insights).length;
      console.log(`[CAMPAIGN FETCH] Insights present in ${insightsCount}/${campaigns.length} campaigns`);
      
      if (insightsCount === 0) {
        console.warn('[CAMPAIGN FETCH] ⚠️ No campaigns have insights data! Check date_preset parameter.');
      }
    }
    
    // Process campaigns with normalized insights
    return campaigns.map(campaign => {
      // Create a base normalized campaign with empty insights
      const normalizedCampaign: MetaCampaign = {
        ...campaign,
        // Ensure insights is always at least an empty object to prevent null reference errors
        insights: campaign.insights || {},
      };
      
      // Calculate derived fields if insights exist
      if (campaign.insights) {
        // Ensure spend is available
        if (!normalizedCampaign.spend && campaign.insights.spend) {
          normalizedCampaign.spend = campaign.insights.spend;
        }
        
        // Calculate results from actions if available
        if (campaign.insights.actions && Array.isArray(campaign.insights.actions)) {
          const purchaseAction = campaign.insights.actions.find(
            (a: any) => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
          );
          
          if (purchaseAction) {
            normalizedCampaign.results = purchaseAction.value;
          }
        }
        
        // Calculate CPA if cost_per_action_type exists
        if (campaign.insights.cost_per_action_type && Array.isArray(campaign.insights.cost_per_action_type)) {
          const purchaseCost = campaign.insights.cost_per_action_type.find(
            (c: any) => c.action_type === 'purchase' || c.action_type === 'omni_purchase'
          );
          
          if (purchaseCost) {
            normalizedCampaign.insights.cpa = purchaseCost.value;
          }
        }
        
        // Calculate ROAS if both spend and results exist
        const spend = parseFloat(campaign.insights.spend || '0');
        const resultValue = parseFloat(normalizedCampaign.results || '0');
        
        if (spend > 0 && resultValue > 0) {
          // Assuming an average order value of $50 for demonstration
          // In a real app, this would come from actual conversion values
          const estimatedRevenue = resultValue * 50;
          const roas = (estimatedRevenue / spend).toFixed(1);
          normalizedCampaign.insights.roas = `${roas}x`;
        }
      }
      
      return normalizedCampaign;
    });
  }
}
