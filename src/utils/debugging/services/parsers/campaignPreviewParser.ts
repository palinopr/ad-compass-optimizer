
import { CampaignPreview } from '../../types/campaignLogTypes';

export const parseCampaignPreviews = (data: any[]): CampaignPreview[] => {
  return data.slice(0, 3).map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    spend: campaign.insights?.spend || '$0.00',
    results: campaign.insights?.actions?.find((a: any) => a.action_type === 'purchase')?.value || '0'
  }));
};

export const hasInsightsData = (data: any[]): boolean => {
  return data.some(item => item.insights?.data?.length > 0);
};
