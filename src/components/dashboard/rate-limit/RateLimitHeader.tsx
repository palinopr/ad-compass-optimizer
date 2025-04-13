
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RateLimitHeaderProps {
  isRateLimited: boolean;
  isOverridden: boolean;
}

const RateLimitHeader: React.FC<RateLimitHeaderProps> = ({ isRateLimited, isOverridden }) => {
  return (
    <CardTitle className="text-base flex items-center gap-2">
      {isRateLimited ? (
        <AlertCircle className="h-4 w-4 text-amber-600" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-600" />
      )}
      Meta API Rate Limit Status
      
      {isOverridden && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Override
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rate limit checks are being bypassed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </CardTitle>
  );
};

export default RateLimitHeader;
