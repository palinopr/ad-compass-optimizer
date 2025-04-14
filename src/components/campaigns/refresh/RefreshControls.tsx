
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh, triggerDisplayRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

const RefreshControls = () => {
  const handleForceRefresh = () => {
    triggerCampaignRefresh(true);
    toast({
      title: "Forcing Campaign Refresh",
      description: "Clearing cache and fetching fresh data from Meta...",
    });
  };

  const handleForceDisplayRefresh = () => {
    triggerDisplayRefresh();
    toast({
      title: "UI Refresh Triggered",
      description: "Forcing component re-render without fetching new data...",
    });
  };

  return (
    <div className="flex gap-2 justify-end mb-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleForceRefresh}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Campaign Data
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleForceDisplayRefresh}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Force UI Refresh
      </Button>
    </div>
  );
};

export default RefreshControls;
