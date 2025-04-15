
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
          impressions: campaign.insights.impressions,
        };

        // Extract results from actions array - now with more detailed logging
        if (campaign.insights.actions && Array.isArray(campaign.insights.actions)) {
          // Log all action types for debugging
          const actionTypes = campaign.insights.actions.map((a: any) => a.action_type);
          console.log(`[CAMPAIGN ${campaign.id}] Available action types:`, actionTypes);
          
          // Try to find the most relevant action type for results
          const conversionTypes = ['offsite_conversion.fb_pixel_purchase', 'purchase', 'omni_purchase', 'offsite_conversion'];
          
          // Find the first matching action type in order of priority
          let relevantAction = null;
          for (const actionType of conversionTypes) {
            relevantAction = campaign.insights.actions.find((a: any) => a.action_type === actionType);
            if (relevantAction) break;
          }
          
          if (relevantAction) {
            normalizedCampaign.results = relevantAction.value;
            const actionType = relevantAction.action_type;
            console.log(`[CAMPAIGN ${campaign.id}] Found results (${actionType}):`, relevantAction.value);
            
            // Find matching CPA for the same action type
            if (campaign.insights.cost_per_action_type && Array.isArray(campaign.insights.cost_per_action_type)) {
              // Log all cost_per_action types for debugging
              const cpaTypes = campaign.insights.cost_per_action_type.map((c: any) => c.action_type);
              console.log(`[CAMPAIGN ${campaign.id}] Available CPA types:`, cpaTypes);
              
              // Try exact match first
              let matchingCpa = campaign.insights.cost_per_action_type.find((c: any) => c.action_type === actionType);
              
              // If no exact match, try to find any purchase-related CPA
              if (!matchingCpa) {
                for (const cpaType of conversionTypes) {
                  matchingCpa = campaign.insights.cost_per_action_type.find((c: any) => c.action_type === cpaType);
                  if (matchingCpa) break;
                }
              }
              
              if (matchingCpa) {
                normalizedCampaign.insights.cpa = matchingCpa.value;
                console.log(`[CAMPAIGN ${campaign.id}] Found CPA (${matchingCpa.action_type}):`, matchingCpa.value);
              } else {
                console.log(`[CAMPAIGN ${campaign.id}] No matching CPA found for action type:`, actionType);
              }
            }
          } else {
            console.log(`[CAMPAIGN ${campaign.id}] No relevant conversion actions found`);
          }
        }
        
        // Get ROAS if available - with improved extraction
        if (campaign.insights.website_purchase_roas && Array.isArray(campaign.insights.website_purchase_roas)) {
          // Log all ROAS entries for debugging
          console.log(`[CAMPAIGN ${campaign.id}] ROAS data:`, campaign.insights.website_purchase_roas);
          
          // First entry is usually the overall ROAS
          const websitePurchaseRoas = campaign.insights.website_purchase_roas[0];
          if (websitePurchaseRoas?.value) {
            normalizedCampaign.insights.roas = `${parseFloat(websitePurchaseRoas.value).toFixed(2)}x`;
            console.log(`[CAMPAIGN ${campaign.id}] Found ROAS:`, normalizedCampaign.insights.roas);
          } else {
            console.log(`[CAMPAIGN ${campaign.id}] No valid ROAS value found`);
          }
        }
        
        // Log processed insights for this campaign
        console.log(`[CAMPAIGN INSIGHTS] Campaign ${campaign.name} (${campaign.id}):`, {
          clicks: normalizedCampaign.insights.clicks || 'missing',
          impressions: normalizedCampaign.insights.impressions || 'missing',
          results: normalizedCampaign.results || 'missing',
          cpa: normalizedCampaign.insights.cpa || 'missing',
          roas: normalizedCampaign.insights.roas || 'missing'
        });
      } else {
        console.log(`[CAMPAIGN FETCH] No insights data for campaign: ${campaign.name} (${campaign.id})`);
      }
      
      return normalizedCampaign;
    });
  }
}
