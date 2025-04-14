
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const StandardReset: React.FC = () => {
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
  );
};
