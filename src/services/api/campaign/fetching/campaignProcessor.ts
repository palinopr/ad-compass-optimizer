
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
      
      // Check for completely empty objects
      const emptyCount = campaigns.filter(c => Object.keys(c).length === 0).length;
      if (emptyCount > 0) {
        console.warn(`⚠️ Meta API returned ${emptyCount}/${campaigns.length} completely empty campaign objects. Possible permissions or token issue.`);
      }
      
      // Check for objects with only ID but no other data
      const idOnlyCount = campaigns.filter(c => Object.keys(c).length === 1 && c.id).length;
      if (idOnlyCount > 0) {
        console.warn(`⚠️ Found ${idOnlyCount}/${campaigns.length} campaigns with ID only but no other data.`);
      }
      
      if (insightsCount === 0) {
        console.warn('[CAMPAIGN FETCH] ⚠️ No campaigns have insights data! Check date_preset parameter.');
        // Mark this in localStorage for diagnostics
        localStorage.setItem('has_valid_campaign_insights', 'false');
        localStorage.setItem('missing_insights_timestamp', new Date().toISOString());
      } else {
        // Mark that we have insights data
        localStorage.setItem('has_valid_campaign_insights', 'true');
        localStorage.setItem('insights_count', String(insightsCount));
      }

      // If we have any campaigns, store this fact for UI state checks
      localStorage.setItem('has_campaigns_data', 'true');
    } else {
      // No campaigns were found at all
      localStorage.setItem('has_campaigns_data', 'false');
    }
    
    return campaigns.map(campaign => {
      // Check for empty campaign object and add warning
      if (Object.keys(campaign).length === 0) {
        console.warn(`⚠️ Processing empty campaign object. Will create minimal placeholder.`);
        return {
          id: `empty-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Empty Campaign Data',
          status: 'unknown',
          insights: {
            // Fix: Add required properties to match MetaCampaign.insights type
            impressions: '0',
            clicks: '0',
            spend: '0',
            cost_per_action_type: [],
            actions: []
          },
          isEmpty: true,
          error: 'Meta API returned empty object'
        };
      }
      
      // Create a base normalized campaign
      const normalizedCampaign: MetaCampaign = {
        ...campaign,
        insights: campaign.insights || {
          // Fix: Ensure default insights object has all required properties
          impressions: '0',
          clicks: '0',
          spend: '0',
          cost_per_action_type: [],
          actions: []
        },
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
      }
      
      return normalizedCampaign;
    });
  }
}
