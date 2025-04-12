
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TokenFreshnessStatusProps {
  tokenInfo: {
    isFresh: boolean;
    age: number;
  };
  daysUntilExpiry: number;
}

const TokenFreshnessStatus: React.FC<TokenFreshnessStatusProps> = ({ tokenInfo, daysUntilExpiry }) => {
  return (
    <>
      <div>Token Freshness:</div>
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {tokenInfo.isFresh ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">Fresh</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-600 mr-1" />
                  <span className="text-amber-600">Aging</span>
                </>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>Token age: {tokenInfo.age} days</p>
              <p>Expires in: {daysUntilExpiry} days</p>
              {tokenInfo.age > 45 && (
                <p>Consider refreshing soon (60 day validity)</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default TokenFreshnessStatus;
