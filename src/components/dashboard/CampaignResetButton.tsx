
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CampaignResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  
  const handleReset = () => {
    setIsResetting(true);
    
    try {
      // Clear all campaign and auth related state
      console.log("Performing full campaign state reset");
      
      // Clear campaign display state
      localStorage.removeItem('campaign_filter_state');
      localStorage.removeItem('cached_campaign_data');
      localStorage.removeItem('last_campaign_fetch_attempt');
      localStorage.removeItem('last_campaign_fetch_success');
      localStorage.removeItem('last_campaign_fetch_error');
      localStorage.removeItem('last_campaign_count');
      localStorage.removeItem('display_issue_detected');
      localStorage.removeItem('had_display_issues');
      localStorage.removeItem('ui_fix_attempted');
      localStorage.removeItem('deep_fix_timestamp');
      
      toast({
        title: "Campaign State Reset",
        description: "All campaign caches and settings have been cleared. Reloading page...",
        duration: 5000,
      });
      
      // Force refresh both campaign events
      window.dispatchEvent(new CustomEvent('campaign-display-refresh', { detail: { force: true }}));
      window.dispatchEvent(new CustomEvent('campaign-data-refresh', { detail: { force: true }}));
      
      // Delay reload to let the toast be visible
      setTimeout(() => {
        window.location.href = '/campaigns?reset=' + Date.now();
      }, 1500);
    } catch (e) {
      toast({
        title: "Reset Failed",
        description: "Unable to complete state reset: " + (e instanceof Error ? e.message : String(e)),
        variant: "destructive"
      });
      setIsResetting(false);
    }
  };

  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Campaign Display Issues Detected</AlertTitle>
      <AlertDescription className="space-y-2 text-amber-700">
        <p>
          If your campaigns aren't displaying even though data has loaded successfully, 
          you may need to reset the application state to fix UI rendering issues.
        </p>
        <Button 
          variant="default" 
          className="mt-2 bg-amber-600 hover:bg-amber-700 text-white" 
          disabled={isResetting}
          onClick={handleReset}
        >
          {isResetting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Resetting...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset Campaign State & Refresh
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default CampaignResetButton;
