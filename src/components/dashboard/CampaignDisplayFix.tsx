
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CampaignDisplayFix = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Check if we have campaigns loaded but not displaying
    const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
    const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
    
    // Only show the alert when we have successful fetches but potential display issues
    setShowAlert(campaignCount > 0 && fetchSuccess);
  }, []);
  
  const handleFixDisplay = () => {
    setIsFixing(true);
    
    // Reset campaign rendering state
    localStorage.removeItem('campaign_filter_state');
    
    // Force refresh event
    window.dispatchEvent(new CustomEvent('campaign-display-refresh', { detail: { force: true } }));
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { detail: { force: true } }));
    
    toast({
      title: "Display Fix Applied",
      description: "Refreshing campaign data display...",
    });
    
    // Navigate to campaigns page after a short delay
    setTimeout(() => {
      window.location.href = '/campaigns';
      setIsFixing(false);
    }, 1000);
  };
  
  if (!showAlert) return null;
  
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Campaign Display Issue Detected</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Your campaign data has been loaded successfully ({localStorage.getItem('last_campaign_count')} campaigns found), 
          but there might be an issue with displaying it.
        </p>
        <Button 
          variant="default" 
          className="mt-2" 
          disabled={isFixing}
          onClick={handleFixDisplay}
        >
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Fixing Display...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Fix Display Issues & View Campaigns
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default CampaignDisplayFix;
