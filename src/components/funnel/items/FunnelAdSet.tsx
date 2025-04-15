
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AdSet, Ad } from '@/services/api/types/funnelTypes';
import FunnelAd from './FunnelAd';

interface FunnelAdSetProps {
  adSet: AdSet;
  ads: Ad[];
  isOpen: boolean;
  renderMetrics: (item: any) => React.ReactNode;
  onToggle: (adSetId: string) => void;
  onSelect: (id: string, name: string, type: 'adset', data: any) => void;
}

const FunnelAdSet: React.FC<FunnelAdSetProps> = ({
  adSet,
  ads,
  isOpen,
  renderMetrics,
  onToggle,
  onSelect
}) => {
  const adSetAds = ads.filter(ad => ad.adset_id === adSet.id);

  return (
    <div className="pl-8 py-2">
      <Collapsible open={isOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
            onClick={() => {
              onToggle(adSet.id);
              onSelect(adSet.id, adSet.name, 'adset', adSet);
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
          {adSetAds.map(ad => (
            <FunnelAd key={ad.id} ad={ad} renderMetrics={renderMetrics} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FunnelAdSet;
