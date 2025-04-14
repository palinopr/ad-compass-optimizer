
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDisplayFixes = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixAttempts, setFixAttempts] = useState(0);
  const { toast } = useToast();

  const handleStandardFix = () => {
    setIsFixing(true);
    setFixAttempts(prev => prev + 1);
    
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    
    window.dispatchEvent(new CustomEvent('campaign-display-refresh'));
    
    toast({
      title: "Refreshing UI Components",
      description: "Attempting to fix display issues...",
    });
    
    setTimeout(() => {
      window.dispatchEvent(new Event('storage')); 
      setIsFixing(false);
      
      toast({
        title: fixAttempts >= 1 ? "Standard Fix Complete" : "Display Refresh Complete",
        description: fixAttempts >= 1 
          ? "If issues persist, try the Deep Fix option."
          : "Check if your campaigns are now visible.",
        duration: 5000,
      });
    }, 1500);
  };

  const handleDeepFix = () => {
    setIsFixing(true);
    
    try {
      const currentRoute = window.location.pathname;
      
      localStorage.removeItem('last_campaign_fetch_attempt');
      localStorage.removeItem('last_campaign_fetch_success');
      localStorage.removeItem('last_campaign_fetch_error');
      localStorage.removeItem('cached_campaign_data');
      localStorage.removeItem('campaign_filter_state');
      
      window.dispatchEvent(new CustomEvent('campaigns-data-reset'));
      
      localStorage.setItem('deep_fix_timestamp', new Date().toISOString());
      
      toast({
        title: "Applying Deep Fix",
        description: "Rebuilding UI state completely, please wait...",
        duration: 5000,
      });
      
      setTimeout(() => {
        window.location.href = '/?clearcache=' + new Date().getTime();
        setTimeout(() => {
          window.location.href = currentRoute + '?restored=' + new Date().getTime();
        }, 500);
      }, 1500);
    } catch (e) {
      console.error("Error during deep fix:", e);
      setIsFixing(false);
      toast({
        title: "Error During Fix",
        description: "Falling back to page reload",
        variant: "destructive",
        duration: 5000,
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return {
    isFixing,
    fixAttempts,
    handleStandardFix,
    handleDeepFix
  };
};
