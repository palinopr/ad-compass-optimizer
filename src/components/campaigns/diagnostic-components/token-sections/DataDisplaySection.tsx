
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Cpu, Loader2, RefreshCcw, Database } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

  // Check if a deep fix was recently applied (within the last 30 seconds)
  const recentlyFixed = React.useMemo(() => {
    const deepFixTimestamp = localStorage.getItem('deep_fix_timestamp');
    if (!deepFixTimestamp) return false;
    
    const fixTime = new Date(deepFixTimestamp).getTime();
    const now = new Date().getTime();
    return (now - fixTime) < 30000; // 30 seconds
  }, []);
  
  useEffect(() => {
    // Show toast if we just returned from a deep fix
    if (recentlyFixed) {
      toast({
        title: "Display Fix Applied",
        description: "The UI has been refreshed to fix display issues.",
        duration: 5000,
      });
    }
  }, [recentlyFixed, toast]);

  // Standard fix - refreshes component state
  const handleStandardFix = () => {
    setIsFixing(true);
    setFixAttempts(prev => prev + 1);
    
    // Clear relevant state in localStorage
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    
    // Force component re-rendering by dispatching an event
    window.dispatchEvent(new CustomEvent('campaign-display-refresh'));
    
    // Show feedback toast
    toast({
      title: "Refreshing UI Components",
      description: "Attempting to fix display issues...",
    });
    
    // Simulate processing time
    setTimeout(() => {
      // Force a re-render by modifying application state
      window.dispatchEvent(new Event('storage')); 
      
      setIsFixing(false);
      
      // Check if more aggressive fix might be needed
      if (fixAttempts >= 1) {
        toast({
          title: "Standard Fix Complete",
          description: "If issues persist, try the Deep Fix option.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Display Refresh Complete",
          description: "Check if your campaigns are now visible.",
          duration: 5000,
        });
      }
    }, 1500);
  };

  // Deep fix - tries to resolve display issues by forcing a complete refresh of component state
  const handleDeepFix = () => {
    setIsFixing(true);
    
    try {
      // Store current route to return to it
      const currentRoute = window.location.pathname;
      
      // Clear all temporary state
      localStorage.removeItem('last_campaign_fetch_attempt');
      localStorage.removeItem('last_campaign_fetch_success');
      localStorage.removeItem('last_campaign_fetch_error');
      
      // Clear any cached campaign data
      localStorage.removeItem('cached_campaign_data');
      localStorage.removeItem('campaign_filter_state');
      
      // Dispatch an event to signal data clearing to any listeners
      window.dispatchEvent(new CustomEvent('campaigns-data-reset'));
      
      // Set a flag to indicate we're doing a deep fix, which components can detect
      localStorage.setItem('deep_fix_timestamp', new Date().toISOString());
      
      toast({
        title: "Applying Deep Fix",
        description: "Rebuilding UI state completely, please wait...",
        duration: 5000,
      });
      
      // Force a hard navigation to clear React component state
      // This is more effective than just reloading
      setTimeout(() => {
        // Navigate to root then back to force component remounting
        window.location.href = '/?clearcache=' + new Date().getTime();
        
        // After a brief delay, return to the original route
        setTimeout(() => {
          window.location.href = currentRoute + '?restored=' + new Date().getTime();
        }, 500);
      }, 1500);
    } catch (e) {
      console.error("Error during deep fix:", e);
      setIsFixing(false);
      // Fallback to normal reload if the deep fix fails
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
            <p>
              Status: 
              {hasUIDisplayIssue ? (
                <span className="text-amber-600 ml-1">Data loaded but not displaying</span>
              ) : hasDataInconsistency ? (
                <span className="text-amber-600 ml-1">Data loaded but may not be displaying</span>
              ) : (
                <span className="text-green-600 ml-1">Should be visible</span>
              )}
            </p>
            
            {recentlyFixed && (
              <div className="text-xs bg-green-50 p-2 border border-green-200 rounded mt-1">
                <p className="font-medium text-green-700">Fix Recently Applied</p>
                <p>UI refresh has been completed. Your campaigns should now be visible.</p>
                <p className="mt-1">If you still don't see your data, try navigating to the Campaigns page.</p>
              </div>
            )}
            
            {(hasDataInconsistency || hasUIDisplayIssue) && !recentlyFixed && (
              <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
                <p className="font-medium">UI/Data Inconsistency Detected</p>
                <p>Your data is loading correctly (fetched {campaignCount} campaigns), but is not displaying in the UI due to:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>UI rendering state issues</li>
                  <li>React component lifecycle problems</li>
                  <li>Cached state preventing updates</li>
                </ul>
                
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-medium mb-1">Recommended Actions:</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-7"
                      onClick={handleStandardFix}
                      disabled={isFixing}
                    >
                      {isFixing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          Standard Fix (Refresh Components)
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white h-8"
                      onClick={handleDeepFix}
                      disabled={isFixing}
                    >
                      {isFixing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Applying Deep Fix...
                        </>
                      ) : (
                        <>
                          <Cpu className="h-3 w-3 mr-1" />
                          Deep Fix (Rebuild Application State)
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-gray-600 mt-1">
                      Try the Standard Fix first. If issues persist, use the Deep Fix option.
                    </div>
                  </div>
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
