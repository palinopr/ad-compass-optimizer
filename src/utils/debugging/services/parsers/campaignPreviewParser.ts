
import { CampaignPreview } from '../../types/campaignLogTypes';

export const parseCampaignPreviews = (data: any[]): CampaignPreview[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    spend: campaign.spend || '$0.00',
    results: campaign.results || '0'
  }));
};

export const hasInsightsData = (data: any[]): boolean => {
  if (!Array.isArray(data)) return false;
  
  return data.some(
    (campaign: any) => campaign.insights && 
    campaign.insights.data && 
    campaign.insights.data.length > 0
  );
};
