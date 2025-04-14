
import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const FunnelViewContainer = () => {
  const { campaigns, isLoading, error } = useCampaigns();

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-8 text-center text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  // The funnel data is already included in the campaigns response
  const funnelData = campaigns[0]?.funnelData || { campaigns: [], adsets: [], ads: [] };

  return (
    <FunnelView 
      campaigns={funnelData.campaigns} 
      adsets={funnelData.adsets} 
      ads={funnelData.ads} 
    />
  );
};

export default FunnelViewContainer;
