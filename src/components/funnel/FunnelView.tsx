
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import TrendsPanel from './TrendsPanel';
import CampaignList from './CampaignList';
import { useItemSelection } from '@/hooks/funnel/useItemSelection';
import { useExpandableItems } from '@/hooks/funnel/useExpandableItems';

interface FunnelViewProps {
  campaigns: MetaCampaign[];
  adsets: AdSet[];
  ads: Ad[];
}

const FunnelView: React.FC<FunnelViewProps> = ({ campaigns, adsets, ads }) => {
  const { openCampaigns, openAdSets, toggleCampaign, toggleAdSet } = useExpandableItems();
  const { selectedItem, insights, isLoading, handleItemSelect, clearSelection } = useItemSelection();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Funnel View</CardTitle>
      </CardHeader>
      <CardContent>
        <CampaignList
          campaigns={campaigns}
          adsets={adsets}
          ads={ads}
          openCampaigns={openCampaigns}
          openAdSets={openAdSets}
          onToggleCampaign={toggleCampaign}
          onToggleAdSet={toggleAdSet}
          onSelectItem={handleItemSelect}
        />

        {selectedItem && (
          <TrendsPanel
            isOpen={!!selectedItem}
            onClose={clearSelection}
            itemId={selectedItem.id}
            itemName={selectedItem.name}
            itemType={selectedItem.type}
            itemData={selectedItem.data}
            insights={insights}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelView;
