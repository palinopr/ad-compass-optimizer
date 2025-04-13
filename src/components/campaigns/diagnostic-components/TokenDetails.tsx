
import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface TokenDetailsProps {
  tokenInfo: {
    hasToken: boolean;
    tokenLength?: number;
    tokenAge?: number | null;
  };
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenInfo }) => {
  const getExpirationWarning = () => {
    if (!tokenInfo.tokenAge) return null;
    
    if (tokenInfo.tokenAge > 60) {
      return (
        <div className="flex items-center gap-1 text-red-600 mt-1">
          <XCircle className="h-4 w-4" />
          <span>Token has expired (standard expiry is 60 days)</span>
        </div>
      );
    } else if (tokenInfo.tokenAge > 50) {
      return (
        <div className="flex items-center gap-1 text-amber-600 mt-1">
          <Clock className="h-4 w-4" />
          <span>Token expiring soon ({60 - tokenInfo.tokenAge} days remaining)</span>
        </div>
      );
    } else if (tokenInfo.hasToken) {
      return (
        <div className="flex items-center gap-1 text-green-600 mt-1">
          <CheckCircle className="h-4 w-4" />
          <span>Token valid for {60 - tokenInfo.tokenAge} more days</span>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Info className="h-4 w-4 text-blue-500" />
        Token Details:
      </h3>
      <div className="text-xs space-y-1 font-mono">
        <p className="flex items-center gap-1">
          {tokenInfo.hasToken ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
          Has Token: {tokenInfo.hasToken ? 'Yes' : 'No'}
        </p>
        
        {tokenInfo.tokenLength !== undefined && (
          <p>Token Length: {tokenInfo.tokenLength} characters
            {tokenInfo.tokenLength < 50 && tokenInfo.hasToken && (
              <span className="text-red-500 ml-1">(Token appears too short)</span>
            )}
          </p>
        )}
        
        {tokenInfo.tokenAge !== null && (
          <p>Token Age: {tokenInfo.tokenAge} days</p>
        )}
        
        {getExpirationWarning()}
      </div>
    </div>
  );
};

export default TokenDetails;
