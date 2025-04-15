
import React from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import TokenStatusSection from './token-status/TokenStatusSection';
import CampaignStatusSection from './campaign-status/CampaignStatusSection';

interface TokenStatusInfo {
  exists: boolean;
  isValid: boolean;
  expiresIn?: number;
}

interface CampaignStatusInfo {
  isFetching: boolean;
  error?: string;
  campaignCount: number;
}

const CampaignTroubleshooter = () => {
  const { toast } = useToast();
  const [tokenStatus, setTokenStatus] = React.useState<TokenStatusInfo>({
    exists: false,
    isValid: false,
  });
  
  const [campaignStatus, setCampaignStatus] = React.useState<CampaignStatusInfo>({
    isFetching: false,
    campaignCount: 0,
  });

  // Check token status on mount
  React.useEffect(() => {
    const token = localStorage.getItem('meta_access_token');
    setTokenStatus({
      exists: !!token,
      isValid: token ? token.length > 50 : false,
    });
  }, []);

  // Listen for campaign fetch events
  React.useEffect(() => {
    const handleCampaignUpdate = (event: CustomEvent) => {
      const data = event.detail;
      setCampaignStatus({
        isFetching: false,
        campaignCount: data.campaigns?.length || 0,
        error: data.error,
      });
    };

    window.addEventListener('campaign-data-update', handleCampaignUpdate as EventListener);
    return () => {
      window.removeEventListener('campaign-data-update', handleCampaignUpdate as EventListener);
    };
  }, []);

  return (
    <Card className="mt-4 p-4 bg-gray-50">
      <h3 className="text-sm font-medium mb-4">Campaign Status</h3>
      
      <TokenStatusSection 
        exists={tokenStatus.exists}
        isValid={tokenStatus.isValid}
      />

      <CampaignStatusSection 
        error={campaignStatus.error}
        isFetching={campaignStatus.isFetching}
        campaignCount={campaignStatus.campaignCount}
      />
    </Card>
  );
};

export default CampaignTroubleshooter;
