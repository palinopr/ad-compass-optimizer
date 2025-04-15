
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
    
    return campaigns.map(campaign => {
      // Create a base normalized campaign
      const normalizedCampaign: MetaCampaign = {
        ...campaign,
        insights: campaign.insights || {},
      };
      
      if (campaign.insights) {
        // Map basic metrics directly
        normalizedCampaign.insights = {
          ...normalizedCampaign.insights,
          clicks: campaign.insights.clicks,
          spend: campaign.insights.spend,
        };

        // Calculate results from actions if available
        if (campaign.insights.actions && Array.isArray(campaign.insights.actions)) {
          const results = campaign.insights.actions
            .filter((a: any) => a.action_type === 'offsite_conversion' || 
                               a.action_type === 'purchase' || 
                               a.action_type === 'omni_purchase')
            .reduce((sum: number, action: any) => sum + parseFloat(action.value || '0'), 0);
          
          normalizedCampaign.results = results.toString();
        }
        
        // Get CPA from cost_per_action_type
        if (campaign.insights.cost_per_action_type && Array.isArray(campaign.insights.cost_per_action_type)) {
          const offsiteConversion = campaign.insights.cost_per_action_type.find(
            (c: any) => c.action_type === 'offsite_conversion'
          );
          const purchase = campaign.insights.cost_per_action_type.find(
            (c: any) => c.action_type === 'purchase' || c.action_type === 'omni_purchase'
          );
          
          if (offsiteConversion || purchase) {
            normalizedCampaign.insights.cpa = (offsiteConversion || purchase).value;
          }
        }
        
        // Calculate ROAS if we have both spend and results
        const spend = parseFloat(campaign.insights.spend || '0');
        const results = parseFloat(normalizedCampaign.results || '0');
        
        if (spend > 0 && results > 0) {
          // Calculate estimated ROAS based on an average order value of 50
          // This is a simplified calculation - in real scenarios this would come from actual conversion values
          const estimatedRevenue = results * 50;
          normalizedCampaign.insights.roas = `${(estimatedRevenue / spend).toFixed(2)}x`;
        }
      }
      
      return normalizedCampaign;
    });
  }
}
