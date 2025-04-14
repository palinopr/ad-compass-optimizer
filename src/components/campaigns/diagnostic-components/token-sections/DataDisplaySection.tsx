
import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import DisplayStatusIndicator from './display-status/DisplayStatusIndicator';
import RecentFixNotification from './display-status/RecentFixNotification';
import FixActions from './display-status/FixActions';
import InconsistencyWarning from './display-status/InconsistencyWarning';
import { useDisplayFixes } from '@/hooks/campaigns/fix-utils/useDisplayFixes';

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
  const { isFixing, fixAttempts, handleStandardFix, handleDeepFix } = useDisplayFixes();
  const { toast } = useToast();

  const recentlyFixed = React.useMemo(() => {
    const deepFixTimestamp = localStorage.getItem('deep_fix_timestamp');
    if (!deepFixTimestamp) return false;
    
    const fixTime = new Date(deepFixTimestamp).getTime();
    const now = new Date().getTime();
    return (now - fixTime) < 30000; // 30 seconds
  }, []);
  
  React.useEffect(() => {
    if (recentlyFixed) {
      toast({
        title: "Display Fix Applied",
        description: "The UI has been refreshed to fix display issues.",
        duration: 5000,
      });
    }
  }, [recentlyFixed, toast]);

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
