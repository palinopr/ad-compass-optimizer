import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TokenDetailsProps {
  tokenInfo: {
    hasToken: boolean;
    tokenLength?: number;
    tokenAge?: number | null;
    source?: string;
    isValid?: boolean;
    permissions?: string[];
  };
  tokenAnalysis?: any; // Add tokenAnalysis prop to the interface
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenInfo, tokenAnalysis }) => {
  const getExpirationWarning = () => {
    if (!tokenInfo.tokenAge && tokenInfo.tokenAge !== 0) return null;
    
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

  const getTokenValidityState = () => {
    if (!tokenInfo.hasToken) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        text: "Missing token",
        class: "text-red-600"
      };
    }
    
    if (tokenInfo.isValid === false) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: "Invalid token format",
        class: "text-red-600"
      };
    }
    
    if (tokenInfo.tokenLength && tokenInfo.tokenLength < 50) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
        text: "Token appears too short",
        class: "text-amber-600"
      };
    }
    
    return {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      text: "Valid token format",
      class: "text-green-600"
    };
  };
  
  const validityState = getTokenValidityState();
  
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
        
        {tokenInfo.tokenAge !== null && tokenInfo.tokenAge !== undefined && (
          <p>Token Age: {tokenInfo.tokenAge} days</p>
        )}

        {tokenInfo.source && (
          <p>Token Source: {tokenInfo.source}</p>
        )}
        
        <div className={`flex items-center gap-1 ${validityState.class} mt-1`}>
          {validityState.icon}
          <span>Status: {validityState.text}</span>
        </div>
        
        {getExpirationWarning()}

        {tokenInfo.permissions && tokenInfo.permissions.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="flex items-start gap-1 mt-2">
              <Shield className="h-3 w-3 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold">Permissions:</p>
                <p className="text-xs break-all">
                  {tokenInfo.permissions.join(', ')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TokenDetails;
