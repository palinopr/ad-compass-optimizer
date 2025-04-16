
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface RoasMetricProps {
  value: string;
  isBlocked?: boolean;
}

export const RoasMetric: React.FC<RoasMetricProps> = ({ value, isBlocked = false }) => {
  return (
    <div className="flex items-center gap-2">
      {value !== '-' ? (
        <span className={parseFloat(value) >= 4 ? 'text-green-600 font-medium' : ''}>
          {value}
        </span>
      ) : '-'}
      {isBlocked && (
        <Tooltip>
          <TooltipTrigger>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>This campaign is blocked due to a permanent error (400). Check permissions or ID validity.</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
