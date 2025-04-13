
import React, { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, Info, XCircle, Shield, Globe, Calendar, Database, ExternalLink, LayoutDashboard, Rotate3D, RefreshCw, Cpu, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isFixing, setIsFixing] = useState(false);
  
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
  
  // Handle full page refresh with cache clearing
  const handleFullPageRefresh = () => {
    // This will attempt to bypass browser cache entirely
    window.location.href = window.location.href + '?nocache=' + new Date().getTime();
  };
  
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
  
  // Check for the data inconsistency scenario (successful fetch but no UI display)
  const hasDataInconsistency = lastFetchSuccess && 
                              parseInt(localStorage.getItem('last_campaign_count') || '0') > 0 &&
                              tokenAnalysis?.cors?.hasCorsIssues;
  
  // Check campaign count
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  
  // Check for confirmed data loading but display issues
  const hasUIDisplayIssue = campaignCount > 0 && (
    // Either user is on campaigns page but no data shows
    window.location.pathname.includes('campaign') || 
    // Or we have explicit CORS issues
    tokenAnalysis?.cors?.hasCorsIssues || 
    // Or there's a mismatch between data fetched and displayed
    localStorage.getItem('display_issue_detected') === 'true'
  );
  
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
              <p>Campaign count: {campaignCount}</p>
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
        
        {/* Data Display Section - Enhanced */}
        {campaignCount > 0 && (
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
        )}
        
        {/* CORS Specific Section - Enhanced */}
        {tokenAnalysis?.cors?.hasCorsIssues && (
          <>
            <Separator className="my-2" />
            <div className="flex items-start gap-1 mt-2">
              <Rotate3D className="h-3 w-3 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold">CORS Issues Detail:</p>
                <div className="space-y-1">
                  <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
                    <p className="font-medium">CORS Issues Despite Facebook Authentication</p>
                    <p>This is unusual and may indicate:</p>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li>Corporate network restrictions or proxies</li>
                      <li>Security browser extensions interfering with requests</li>
                      <li>Mixed content blocking from your browser</li>
                      <li>VPN or firewall restrictions</li>
                    </ul>
                    
                    <div className="mt-2 pt-2 border-t border-amber-200">
                      <p className="font-medium">Try This Fix:</p>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white h-8"
                        onClick={handleFullPageRefresh}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Force Full Page Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Advanced Troubleshooting Section - Enhanced */}
        <Separator className="my-2" />
        <Collapsible>
          <CollapsibleTrigger className="flex items-center w-full justify-between text-sm font-semibold py-1">
            <span>Advanced Troubleshooting</span>
            <RefreshCw className="h-3 w-3" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-3">
              {tokenAnalysis?.cors?.hasCorsIssues && (
                <div className="bg-amber-50 border border-amber-200 p-2 rounded">
                  <p className="text-amber-700 font-medium">CORS Issues Detected</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Browser security is preventing direct API calls. This can cause data loading issues even with valid authentication.
                  </p>
                  <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                    <li>Try using a different browser (Firefox often works better)</li>
                    <li>Disable browser extensions that might block requests</li>
                    <li>Use Firefox or Edge instead of Chrome</li>
                  </ul>
                </div>
              )}
              
              {(hasDataInconsistency || hasUIDisplayIssue) && (
                <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                  <p className="text-blue-700 font-medium">UI/Data Inconsistency</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Data is loading from the API ({campaignCount} campaigns) but may not be displaying in the UI.
                  </p>
                  <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                    <li>Try the "Force UI Refresh" option below</li>
                    <li>Check your browser console (F12) for JavaScript errors</li>
                    <li>Try with a different browser</li>
                    <li>Clear your browser cache completely</li>
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
                
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-xs h-7" 
                    onClick={handleForceReload}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Force Reload Page
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7" 
                    onClick={handleHardReset}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Hard Reset Auth
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-xs h-7" 
                    onClick={handleFullPageRefresh}
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Force UI Refresh
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                If you're still having issues, try opening your browser's developer console (F12) and check for network errors when loading campaigns.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default TokenDetails;
