
import { useMemo } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

export const useCampaignMetrics = (campaigns: MetaCampaign[] = []) => {
  return useMemo(() => {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalCPA = 0;
    let validCPACount = 0;
    
    campaigns.forEach(campaign => {
      if (campaign.insights) {
        if (campaign.insights.impressions) {
          totalImpressions += parseInt(campaign.insights.impressions.replace(/,/g, '')) || 0;
        }
        
        if (campaign.insights.clicks) {
          totalClicks += parseInt(campaign.insights.clicks.replace(/,/g, '')) || 0;
        }
        
        if (campaign.insights.spend) {
          const spendValue = parseFloat(campaign.insights.spend.replace(/[$,]/g, '')) || 0;
          totalSpend += spendValue;
        }
        
        if (campaign.insights.cpa && campaign.insights.cpa !== '-') {
          const cpaValue = parseFloat(campaign.insights.cpa.replace(/[$,]/g, '')) || 0;
          if (cpaValue > 0) {
            totalCPA += cpaValue;
            validCPACount++;
          }
        }
      }
    });
    
    const formatter = new Intl.NumberFormat('en-US');
    const currencyFormatter = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return {
      impressions: formatter.format(totalImpressions),
      clicks: formatter.format(totalClicks),
      spend: currencyFormatter.format(totalSpend),
      cpa: validCPACount > 0 ? currencyFormatter.format(totalCPA / validCPACount) : '$0.00'
    };
  }, [campaigns]);
};
