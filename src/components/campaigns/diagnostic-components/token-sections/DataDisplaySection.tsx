
import React, { useState } from 'react';
import { LayoutDashboard, Cpu, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
      
      // Force a hard navigation to clear React component state
      // This is more effective than just reloading
      setTimeout(() => {
        // Navigate to root then back to force component remounting
        window.location.href = '/?clearcache=' + new Date().getTime();
        
        // After a brief delay, return to the original route
        setTimeout(() => {
          window.location.href = currentRoute + '?restored=' + new Date().getTime();
        }, 500);
      }, 100);
    } catch (e) {
      console.error("Error during deep fix:", e);
      // Fallback to normal reload if the deep fix fails
      window.location.reload();
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
        <div>
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
            
            {(hasDataInconsistency || hasUIDisplayIssue) && (
              <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
                <p className="font-medium">UI/Data Inconsistency Detected</p>
                <p>Your data is loading correctly (fetched {campaignCount} campaigns), but is not displaying in the UI due to:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>UI rendering state issues</li>
                  <li>React component lifecycle problems</li>
                  <li>Cached state preventing updates</li>
                </ul>
                
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="font-medium">Recommended Action:</p>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="mt-1 w-full bg-amber-600 hover:bg-amber-700 text-white h-8"
                    onClick={handleDeepFix}
                    disabled={isFixing}
                  >
                    {isFixing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Fixing Display Issues...
                      </>
                    ) : (
                      <>
                        <Cpu className="h-3 w-3 mr-1" />
                        Fix Display Issues
                      </>
                    )}
                  </Button>
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
