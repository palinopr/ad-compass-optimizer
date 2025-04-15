
import React from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
      
      {/* Token Status */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span>Token Status:</span>
          <span className={tokenStatus.exists ? 'text-green-600' : 'text-red-600'}>
            {tokenStatus.exists ? 'FOUND' : 'NOT FOUND'}
          </span>
        </div>
      </div>

      {/* Campaign Status */}
      {campaignStatus.error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{campaignStatus.error}</AlertDescription>
        </Alert>
      ) : (
        <div className="text-sm">
          <p>Campaigns loaded: {campaignStatus.campaignCount}</p>
          {campaignStatus.isFetching && <p>Fetching campaigns...</p>}
        </div>
      )}
    </Card>
  );
};

export default CampaignTroubleshooter;
