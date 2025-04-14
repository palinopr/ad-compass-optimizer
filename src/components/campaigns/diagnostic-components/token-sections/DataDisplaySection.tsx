
import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import DisplayStatusIndicator from './display-status/DisplayStatusIndicator';
import RecentFixNotification from './display-status/RecentFixNotification';
import FixActions from './display-status/FixActions';
import InconsistencyWarning from './display-status/InconsistencyWarning';

interface DataDisplaySectionProps {
  campaignCount: number;
  hasUIDisplayIssue: boolean;
  hasDataInconsistency: boolean;
}

const DataDisplaySection: React.FC<DataDisplaySectionProps> = ({
  campaignCount,
  hasUIDisplayIssue,
  hasDataInconsistency
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();
  const [fixAttempts, setFixAttempts] = useState(0);

  const recentlyFixed = React.useMemo(() => {
    const deepFixTimestamp = localStorage.getItem('deep_fix_timestamp');
    if (!deepFixTimestamp) return false;
    
    const fixTime = new Date(deepFixTimestamp).getTime();
    const now = new Date().getTime();
    return (now - fixTime) < 30000; // 30 seconds
  }, []);
  
  useEffect(() => {
    if (recentlyFixed) {
      toast({
        title: "Display Fix Applied",
        description: "The UI has been refreshed to fix display issues.",
        duration: 5000,
      });
    }
  }, [recentlyFixed, toast]);

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

  if (campaignCount === 0) {
    return null;
  }

  return (
    <>
      <Separator className="my-2" />
      <div className="flex items-start gap-1 mt-2">
        <LayoutDashboard className="h-3 w-3 text-blue-500 mt-0.5" />
        <div className="w-full">
          <p className="font-semibold">Data Display:</p>
          <div className="space-y-1">
            <DisplayStatusIndicator 
              hasUIDisplayIssue={hasUIDisplayIssue}
              hasDataInconsistency={hasDataInconsistency}
            />
            
            <RecentFixNotification recentlyFixed={recentlyFixed} />
            
            {(hasDataInconsistency || hasUIDisplayIssue) && !recentlyFixed && (
              <div className="mt-2 space-y-2">
                <InconsistencyWarning campaignCount={campaignCount} />
                
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-medium mb-1">Recommended Actions:</p>
                  <FixActions
                    onStandardFix={handleStandardFix}
                    onDeepFix={handleDeepFix}
                    fixAttempts={fixAttempts}
                    isFixing={isFixing}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DataDisplaySection;
