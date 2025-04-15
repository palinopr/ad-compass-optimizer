
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug } from 'lucide-react';
import MetaApiError from '../../error-display/MetaApiError';

interface CampaignStatusSectionProps {
  error?: any;
  isFetching: boolean;
  campaignCount: number;
}

const CampaignStatusSection = ({ error, isFetching, campaignCount }: CampaignStatusSectionProps) => {
  if (error) {
    return <MetaApiError error={error} />;
  }

  return (
    <div className="text-sm space-y-2">
      {campaignCount === 0 && !isFetching && !error ? (
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            Empty response received from Meta API — no campaigns returned.
          </AlertDescription>
        </Alert>
      ) : (
        <p>Campaigns loaded: {campaignCount}</p>
      )}
      {isFetching && <p>Fetching campaigns...</p>}
    </div>
  );
};

export default CampaignStatusSection;
