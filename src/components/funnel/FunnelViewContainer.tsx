
import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { FunnelData } from '@/services/api/types/funnelTypes';

const FunnelViewContainer = () => {
  const { campaigns, isLoading, error } = useCampaigns();
  const [funnelData, setFunnelData] = useState<FunnelData>({ campaigns: [], adsets: [], ads: [] });
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFunnelData = async () => {
      const token = metaAuthService.getAccessToken();
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      
      if (!token || !selectedAdAccount) {
        setFunnelError('Missing access token or ad account');
        return;
      }

      try {
        setIsFetchingFunnel(true);
        const data = await MetaFunnelService.fetchFunnelData(token, selectedAdAccount);
        setFunnelData(data);
        setFunnelError(null);
      } catch (err) {
        console.error('Error fetching funnel data:', err);
        setFunnelError(err instanceof Error ? err.message : 'Failed to fetch funnel data');
      } finally {
        setIsFetchingFunnel(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (isLoading || isFetchingFunnel) {
    return (
      <Card>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error || funnelError) {
    return (
      <Card>
        <div className="p-8 text-center text-red-500">
          {error || funnelError}
        </div>
      </Card>
    );
  }

  return (
    <FunnelView 
      campaigns={funnelData.campaigns} 
      adsets={funnelData.adsets} 
      ads={funnelData.ads} 
    />
  );
};

export default FunnelViewContainer;
