
import { MetaCampaign } from '../../types/metaCampaignTypes';

export class CampaignProcessor {
  static processCampaigns(campaigns: any[]): MetaCampaign[] {
    console.log(`[CAMPAIGN FETCH] Processing ${campaigns.length} campaigns`);
    
    // Log insights presence for debugging
    if (campaigns.length > 0) {
      // Log sample campaign structure
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

        // Extract results from actions array
        if (campaign.insights.actions && Array.isArray(campaign.insights.actions)) {
          const relevantAction = campaign.insights.actions.find(
            (a: any) => a.action_type === 'offsite_conversion' || 
                       a.action_type === 'purchase' || 
                       a.action_type === 'omni_purchase'
          );
          
          if (relevantAction) {
            normalizedCampaign.results = relevantAction.value;
            const actionType = relevantAction.action_type;
            
            // Find matching CPA for the same action type
            if (campaign.insights.cost_per_action_type && Array.isArray(campaign.insights.cost_per_action_type)) {
              const matchingCpa = campaign.insights.cost_per_action_type.find(
                (c: any) => c.action_type === actionType
              );
              if (matchingCpa) {
                normalizedCampaign.insights.cpa = matchingCpa.value;
              }
            }
          }
        }
        
        // Get ROAS if available
        if (campaign.insights.website_purchase_roas && Array.isArray(campaign.insights.website_purchase_roas)) {
          const websitePurchaseRoas = campaign.insights.website_purchase_roas[0];
          if (websitePurchaseRoas?.value) {
            normalizedCampaign.insights.roas = `${parseFloat(websitePurchaseRoas.value).toFixed(2)}x`;
          }
        }
        
        // Log processed insights for this campaign
        console.log(`[CAMPAIGN INSIGHTS] Campaign ${campaign.name}:`, {
          clicks: normalizedCampaign.insights.clicks || 'missing',
          results: normalizedCampaign.results || 'missing',
          cpa: normalizedCampaign.insights.cpa || 'missing',
          roas: normalizedCampaign.insights.roas || 'missing'
        });
      }
      
      return normalizedCampaign;
    });
  }
}

