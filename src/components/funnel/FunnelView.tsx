import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import { Button } from '@/components/ui/button';
import TrendsPanel from './TrendsPanel';
import { useItemInsights } from '@/hooks/funnel/useItemInsights';

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

  const handleItemClick = async (id: string, name: string, type: 'campaign' | 'adset', data: any) => {
    setSelectedItem({ id, name, type, data });
    await fetchInsights(id, type);
  };

  const getMetricDisplay = (value: string | undefined) => {
    return value || '-';
  };

  const renderMetrics = (item: any) => (
    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
      <div>
        <span className="font-medium">Spend:</span> {getMetricDisplay(item.insights?.spend || item.spend)}
      </div>
      <div>
        <span className="font-medium">Status:</span>{' '}
        <span className={item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>
          {item.status?.toLowerCase()}
        </span>
      </div>
      <div>
        <span className="font-medium">Impressions:</span>{' '}
        {getMetricDisplay(item.insights?.impressions)}
      </div>
      <div>
        <span className="font-medium">Clicks:</span>{' '}
        {getMetricDisplay(item.insights?.clicks)}
      </div>
    </div>
  );

  console.log('[FUNNEL VIEW] Campaigns data:', campaigns);

  if (!campaigns || campaigns.length === 0) {
    console.log('[FUNNEL VIEW] No campaigns to display');
    return (
      <div className="p-4 text-center text-gray-500">
        No campaigns found. Please try refreshing the data.
      </div>
    );
  }

  const renderAd = (ad: Ad) => (
    <div key={ad.id} className="pl-16 py-2 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{ad.name}</span>
        </div>
        {renderMetrics(ad)}
      </div>
    </div>
  );

  const renderAdSet = (adSet: AdSet, campaignAds: Ad[]) => {
    const isOpen = openAdSets.includes(adSet.id);
    const adSetAds = campaignAds.filter(ad => ad.adset_id === adSet.id);

    return (
      <div key={adSet.id} className="pl-8 py-2">
        <Collapsible open={isOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
              onClick={() => {
                toggleAdSet(adSet.id);
                handleItemClick(adSet.id, adSet.name, 'adset', adSet);
              }}
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">{adSet.name}</span>
              </div>
              {renderMetrics(adSet)}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {adSetAds.map(renderAd)}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Funnel View</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.map(campaign => {
          const isOpen = openCampaigns.includes(campaign.id);
          const campaignAdSets = adsets.filter(
            adset => adset.campaign_id === campaign.id
          );
          const campaignAds = ads.filter(ad =>
            campaignAdSets.some(adset => adset.id === ad.adset_id)
          );

          return (
            <Collapsible key={campaign.id} open={isOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
                  onClick={() => {
                    toggleCampaign(campaign.id);
                    handleItemClick(campaign.id, campaign.name, 'campaign', campaign);
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
                {campaignAdSets.map(adSet => renderAdSet(adSet, campaignAds))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

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
