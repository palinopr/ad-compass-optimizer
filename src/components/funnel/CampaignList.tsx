
import React from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import FunnelCampaign from './items/FunnelCampaign';
import { renderMetrics } from './utils/MetricsDisplay';

interface CampaignListProps {
  campaigns: MetaCampaign[];
  adsets: AdSet[];
  ads: Ad[];
  openCampaigns: string[];
  openAdSets: string[];
  onToggleCampaign: (campaignId: string) => void;
  onToggleAdSet: (adSetId: string) => void;
  onSelectItem: (id: string, name: string, type: 'campaign' | 'adset', data: any) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  adsets,
  ads,
  openCampaigns,
  openAdSets,
  onToggleCampaign,
  onToggleAdSet,
  onSelectItem
}) => {
  return (
    <div className="space-y-2">
      {campaigns.map(campaign => (
        <FunnelCampaign
          key={campaign.id}
          campaign={campaign}
          adsets={adsets}
          ads={ads}
          isOpen={openCampaigns.includes(campaign.id)}
          openAdSets={openAdSets}
          renderMetrics={renderMetrics}
          onToggleCampaign={onToggleCampaign}
          onToggleAdSet={onToggleAdSet}
          onSelectItem={onSelectItem}
        />
      ))}
    </div>
  );
};

export default CampaignList;
