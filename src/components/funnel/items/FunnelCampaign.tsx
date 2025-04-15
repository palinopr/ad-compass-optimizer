
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import FunnelAdSet from './FunnelAdSet';

interface FunnelCampaignProps {
  campaign: MetaCampaign;
  adsets: AdSet[];
  ads: Ad[];
  isOpen: boolean;
  openAdSets: string[];
  renderMetrics: (item: any) => React.ReactNode;
  onToggleCampaign: (campaignId: string) => void;
  onToggleAdSet: (adSetId: string) => void;
  onSelectItem: (id: string, name: string, type: 'campaign' | 'adset', data: any) => void;
}

const FunnelCampaign: React.FC<FunnelCampaignProps> = ({
  campaign,
  adsets,
  ads,
  isOpen,
  openAdSets,
  renderMetrics,
  onToggleCampaign,
  onToggleAdSet,
  onSelectItem
}) => {
  const campaignAdSets = adsets.filter(adset => adset.campaign_id === campaign.id);

  return (
    <Collapsible key={campaign.id} open={isOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
          onClick={() => {
            onToggleCampaign(campaign.id);
            onSelectItem(campaign.id, campaign.name, 'campaign', campaign);
          }}
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{campaign.name}</span>
          </div>
          {renderMetrics(campaign)}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {campaignAdSets.map(adSet => (
          <FunnelAdSet
            key={adSet.id}
            adSet={adSet}
            ads={ads}
            isOpen={openAdSets.includes(adSet.id)}
            renderMetrics={renderMetrics}
            onToggle={onToggleAdSet}
            onSelect={(id, name) => onSelectItem(id, name, 'adset', adSet)}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FunnelCampaign;
