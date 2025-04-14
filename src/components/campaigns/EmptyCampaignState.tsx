
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmptyCampaignStateProps {
  onRefresh: () => void;
  hasLastFetchSuccess: boolean;
}

const EmptyCampaignState = ({ onRefresh, hasLastFetchSuccess }: EmptyCampaignStateProps) => {
  return (
    <Card className="p-4">
      <div className="text-center text-gray-500">
        <p className="mb-2">No campaigns found in this ad account.</p>
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex gap-1 text-xs"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Campaigns
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmptyCampaignState;
