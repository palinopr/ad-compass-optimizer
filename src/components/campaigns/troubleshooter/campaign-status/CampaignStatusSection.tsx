
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CampaignStatusSectionProps {
  error?: string;
  isFetching: boolean;
  campaignCount: number;
}

const CampaignStatusSection = ({ error, isFetching, campaignCount }: CampaignStatusSectionProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="text-sm">
      <p>Campaigns loaded: {campaignCount}</p>
      {isFetching && <p>Fetching campaigns...</p>}
    </div>
  );
};

export default CampaignStatusSection;
