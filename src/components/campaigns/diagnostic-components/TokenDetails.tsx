
import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle, Shield, Globe, Calendar, Database } from 'lucide-react';
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
  tokenAnalysis?: any; // Token analysis prop
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
  
  // Get the most recent fetch attempt timestamp from localStorage
  const lastFetchAttempt = localStorage.getItem('last_campaign_fetch_attempt');
  const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  // Format the timestamp for display if it exists
  const formattedFetchTime = lastFetchAttempt ? new Date(lastFetchAttempt).toLocaleTimeString() : 'Unknown';
  
  // Get any stored errors
  const fetchErrorRaw = localStorage.getItem('last_campaign_fetch_error');
  let fetchError = null;
  try {
    if (fetchErrorRaw) {
      const errorObj = JSON.parse(fetchErrorRaw);
      fetchError = errorObj.message || 'Unknown error';
    }
  } catch (e) {
    fetchError = fetchErrorRaw || 'Error parsing error details';
  }
  
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
        
        {/* API Status Section */}
        <Separator className="my-2" />
        <div className="flex items-start gap-1 mt-2">
          <Globe className="h-3 w-3 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold">API Status:</p>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="mr-1">Last check:</span>
                <span className="bg-gray-100 px-1 rounded">{formattedFetchTime}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">Success:</span>
                {lastFetchSuccess ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Yes
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> No
                  </span>
                )}
              </div>
              {!lastFetchSuccess && fetchError && (
                <div className="text-red-600 text-xs break-all">
                  <p className="font-medium">Error:</p>
                  <p className="bg-red-50 p-1 rounded border border-red-100">{fetchError}</p>
                </div>
              )}
              {tokenAnalysis && tokenAnalysis.issues && tokenAnalysis.issues.length > 0 && (
                <div className="text-amber-600 text-xs mt-1">
                  <p className="font-medium">Issues:</p>
                  {tokenAnalysis.issues.map((issue: string, i: number) => (
                    <p key={i} className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{issue}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Data Loading Section */}
        <Separator className="my-2" />
        <div className="flex items-start gap-1 mt-2">
          <Database className="h-3 w-3 text-blue-500 mt-0.5" />
          <div>
            <p className="font-semibold">Data Loading:</p>
            <div className="space-y-1">
              <p>Campaign count: {localStorage.getItem('last_campaign_count') || '0'}</p>
              <p>
                CORS issues: 
                {tokenAnalysis?.cors?.hasCorsIssues ? (
                  <span className="text-amber-600 ml-1">Detected</span>
                ) : (
                  <span className="text-green-600 ml-1">None</span>
                )}
              </p>
              <p>
                Selected ad account: 
                <span className="ml-1">{localStorage.getItem('selected_ad_account') || 'None'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
