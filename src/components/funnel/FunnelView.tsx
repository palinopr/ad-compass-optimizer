
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import { useItemInsights } from '@/hooks/funnel/useItemInsights';
import TrendsPanel from './TrendsPanel';
import FunnelCampaign from './items/FunnelCampaign';
import { renderMetrics } from './utils/MetricsDisplay';

interface FunnelViewProps {
  campaigns: MetaCampaign[];
  adsets: AdSet[];
  ads: Ad[];
}

const FunnelView: React.FC<FunnelViewProps> = ({ campaigns, adsets, ads }) => {
  const [openCampaigns, setOpenCampaigns] = useState<string[]>([]);
  const [openAdSets, setOpenAdSets] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: 'campaign' | 'adset';
    data: any;
  } | null>(null);
  
  const { insights, isLoading, fetchInsights } = useItemInsights();

  const toggleCampaign = (campaignId: string) => {
    setOpenCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleAdSet = (adSetId: string) => {
    setOpenAdSets(prev => 
      prev.includes(adSetId)
        ? prev.filter(id => id !== adSetId)
        : [...prev, adSetId]
    );
  };

  const handleItemSelect = async (id: string, name: string, type: 'campaign' | 'adset', data: any) => {
    setSelectedItem({ id, name, type, data });
    await fetchInsights(id, type);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Funnel View</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.map(campaign => (
          <FunnelCampaign
            key={campaign.id}
            campaign={campaign}
            adsets={adsets}
            ads={ads}
            isOpen={openCampaigns.includes(campaign.id)}
            openAdSets={openAdSets}
            renderMetrics={renderMetrics}
            onToggleCampaign={toggleCampaign}
            onToggleAdSet={toggleAdSet}
            onSelectItem={handleItemSelect}
          />
        ))}

        {selectedItem && (
          <TrendsPanel
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
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
