
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, AlertCircle, Cpu } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CampaignResetButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  
  // Check if we have a data/UI inconsistency
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const hasDataButNotShowing = campaignCount > 0 && fetchSuccess;
  
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
  
  // New function for a more aggressive deep fix
  const handleDeepReset = () => {
    setIsResetting(true);
    
    try {
      console.log("Performing deep system reset and full component rebuild");
      
      // Clear ALL localStorage items that could affect rendering
      for (const key of Object.keys(localStorage)) {
        if (key.includes('campaign') || 
            key.includes('meta') || 
            key.includes('fetch') || 
            key.includes('display') || 
            key.includes('cache') || 
            key.includes('fix') ||
            key.includes('data')) {
          console.log(`Clearing localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      }
      
      // Force clear React component cache by adding special URL parameters
      localStorage.setItem('force_rebuild_timestamp', Date.now().toString());
      
      toast({
        title: "Deep System Reset",
        description: "Performing full application state rebuild. Please wait...",
        duration: 5000,
      });
      
      // Step 1: Navigate to root first to completely unmount all components
      setTimeout(() => {
        window.location.href = '/?purge=true&ts=' + Date.now();
        
        // Step 2: After a brief delay, go to campaigns with special rebuild flags
        setTimeout(() => {
          window.location.href = '/campaigns?rebuild=true&force=true&ts=' + Date.now();
        }, 1000);
      }, 1500);
    } catch (e) {
      toast({
        title: "Deep Reset Failed",
        description: "Unable to complete system reset: " + (e instanceof Error ? e.message : String(e)),
        variant: "destructive"
      });
      setIsResetting(false);
    }
  };

  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Campaign Display Issues Detected</AlertTitle>
      <AlertDescription className="space-y-3 text-amber-700">
        <p>
          {hasDataButNotShowing 
            ? `Data has loaded successfully (${campaignCount} campaigns found) but is not displaying correctly in the UI.` 
            : "If your campaigns aren't displaying even though data has loaded successfully, you may need to reset the application state to fix UI rendering issues."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <Button 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700 text-white" 
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
                Standard Reset & Refresh
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            disabled={isResetting}
            onClick={handleDeepReset}
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Deep Resetting...
              </>
            ) : (
              <>
                <Cpu className="mr-2 h-4 w-4" />
                Deep System Reset
              </>
            )}
          </Button>
        </div>
        
        {hasDataButNotShowing && (
          <div className="text-xs bg-amber-100 p-2 rounded mt-2">
            <strong>Note:</strong> The diagnostic shows {campaignCount} campaigns were successfully loaded from the API, 
            but they're not displaying in the UI. This typically indicates a React component rendering issue.
            Try the Deep System Reset for a complete rebuild of the application state.
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default CampaignResetButton;
