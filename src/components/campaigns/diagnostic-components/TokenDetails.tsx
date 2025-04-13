
import React from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle, Shield, Globe, Calendar, Database, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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

  // Force reload function to clear cache and reload page
  const handleForceReload = () => {
    // Clear all relevant cache items
    localStorage.removeItem('last_campaign_fetch_attempt');
    localStorage.removeItem('last_campaign_fetch_success');
    localStorage.removeItem('last_campaign_fetch_error');
    localStorage.removeItem('last_campaign_count');
    
    // Force reload the page
    window.location.reload();
  };
  
  // Handle hard reset of auth
  const handleHardReset = () => {
    // Clear all auth-related items
    localStorage.removeItem('meta_access_token');
    localStorage.removeItem('meta_auth_valid');
    localStorage.removeItem('meta_auth_checked');
    localStorage.removeItem('meta_user_id');
    localStorage.removeItem('meta_user_name');
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    localStorage.removeItem('last_campaign_fetch_attempt');
    localStorage.removeItem('last_campaign_fetch_success');
    localStorage.removeItem('last_campaign_fetch_error');
    localStorage.removeItem('last_campaign_count');
    
    // Force reload the page
    window.location.reload();
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
        
        {/* Advanced Troubleshooting Section */}
        <Separator className="my-2" />
        <div className="mt-2 space-y-3">
          <p className="font-semibold text-sm">Advanced Troubleshooting:</p>
          
          {tokenAnalysis?.cors?.hasCorsIssues && (
            <div className="bg-amber-50 border border-amber-200 p-2 rounded">
              <p className="text-amber-700 font-medium">CORS Issues Detected</p>
              <p className="text-xs text-amber-600 mt-1">
                Browser security is preventing direct API calls. This can cause data loading issues even with valid authentication.
              </p>
              <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                <li>Try using a different browser (Firefox often works better)</li>
                <li>Disable browser extensions that might block requests</li>
                <li>Use Facebook Login instead of token-based authentication</li>
              </ul>
            </div>
          )}
          
          {parseInt(localStorage.getItem('last_campaign_count') || '0') === 0 && lastFetchSuccess && (
            <div className="bg-blue-50 border border-blue-200 p-2 rounded">
              <p className="text-blue-700 font-medium">No Campaigns Found</p>
              <p className="text-xs text-blue-600 mt-1">
                Your connection is working, but no campaigns were found in this ad account.
              </p>
              <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                <li>Try selecting a different ad account</li>
                <li>Verify campaigns exist in this account in Meta Ads Manager</li>
                <li>Check if the account is active and not restricted</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <a 
              href="https://developers.facebook.com/tools/debug/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Meta Debug Tools
            </a>
            
            <div className="flex gap-2 mt-1">
              <Button 
                variant="destructive" 
                size="sm" 
                className="text-xs h-7" 
                onClick={handleForceReload}
              >
                Force Reload Page
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7" 
                onClick={handleHardReset}
              >
                Hard Reset Auth
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            If you're still having issues, try opening your browser's developer console (F12) and check for network errors when loading campaigns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenDetails;
