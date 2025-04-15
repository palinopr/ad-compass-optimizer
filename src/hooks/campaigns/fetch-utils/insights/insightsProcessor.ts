
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';

export const processInsightsData = (insightsData: any): CampaignExtraStats => {
  const results: CampaignExtraStats = {
    results: '-',
    cpa: '-',
    roas: '-',
    spend: insightsData.spend || '-',
    clicks: insightsData.clicks || '-',
    impressions: insightsData.impressions || '-'
  };

  // Extract results from actions array
  if (insightsData.actions && Array.isArray(insightsData.actions)) {
    const conversionTypes = [
      'offsite_conversion.fb_pixel_purchase',
      'purchase',
      'omni_purchase',
      'offsite_conversion'
    ];

    let relevantAction = null;
    for (const actionType of conversionTypes) {
      relevantAction = insightsData.actions.find((a: any) => a.action_type === actionType);
      if (relevantAction) {
        console.log(`[INSIGHTS PROCESS] Found ${actionType} action:`, relevantAction);
        break;
      }
    }

    if (relevantAction) {
      results.results = relevantAction.value;
    }
  }

  // Extract CPA from cost_per_action_type
  if (insightsData.cost_per_action_type && Array.isArray(insightsData.cost_per_action_type)) {
    const cpaTypes = [
      'offsite_conversion.fb_pixel_purchase',
      'purchase',
      'omni_purchase',
      'offsite_conversion'
    ];

    let relevantCpa = null;
    for (const cpaType of cpaTypes) {
      relevantCpa = insightsData.cost_per_action_type.find((c: any) => c.action_type === cpaType);
      if (relevantCpa) {
        console.log(`[INSIGHTS PROCESS] Found ${cpaType} CPA:`, relevantCpa);
        break;
      }
    }

    if (relevantCpa) {
      results.cpa = relevantCpa.value;
    }
  }

  // Extract ROAS from website_purchase_roas
  if (insightsData.website_purchase_roas && Array.isArray(insightsData.website_purchase_roas)) {
    if (insightsData.website_purchase_roas.length > 0) {
      const roasValue = parseFloat(insightsData.website_purchase_roas[0].value);
      results.roas = `${roasValue.toFixed(2)}x`;
      console.log(`[INSIGHTS PROCESS] Found ROAS:`, results.roas);
    }
  }

  return results;
};
