
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FixActionsProps {
  onStandardFix: () => void;
  onDeepFix: () => void;
  fixAttempts: number;
  isFixing: boolean;
}

const FixActions: React.FC<FixActionsProps> = ({
  onStandardFix,
  onDeepFix,
  fixAttempts,
  isFixing
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 h-7"
        onClick={onStandardFix}
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
        onClick={onDeepFix}
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
  );
};

export default FixActions;
