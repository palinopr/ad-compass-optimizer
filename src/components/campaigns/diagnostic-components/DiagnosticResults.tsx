
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, AlertCircle, RefreshCw, Loader2, Info, Globe, CheckCircle, XCircle, Search, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DiagnosticResultsProps {
  diagnosticResults: any;
  hasIssues: boolean;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  diagnosticResults,
  hasIssues,
}) => {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const isAuthenticated = diagnosticResults?.token?.hasToken && 
                          diagnosticResults?.tokenAnalysis?.isValid !== false &&
                          diagnosticResults?.token?.tokenLength > 50;

  const hasRequiredPermissions = diagnosticResults?.token?.hasAdsRead || 
                                diagnosticResults?.token?.hasAdsManagement;
                              
  const apiConnectionSuccess = diagnosticResults?.api?.success === true;
  
  const hasAdAccount = !!localStorage.getItem('selected_ad_account');
  
  const campaignLoadSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  const hasCampaigns = parseInt(localStorage.getItem('last_campaign_count') || '0') > 0;

  const getIssuesList = () => {
    if (!diagnosticResults) return [];
    
    const issues = [];
    
    if (!isAuthenticated) {
      issues.push("Not authenticated with Meta. Please connect your account.");
    }
    
    if (isAuthenticated && !hasRequiredPermissions) {
      issues.push("Missing required permissions for accessing campaign data.");
    }
    
    if (isAuthenticated && !apiConnectionSuccess) {
      const errorMsg = diagnosticResults?.api?.error?.message || 'Unknown error';
      const errorCode = diagnosticResults?.api?.error?.code || '';
      issues.push(`Unable to connect to Meta API: ${errorMsg} ${errorCode ? `(Code: ${errorCode})` : ''}`);
    }
    
    if (isAuthenticated && apiConnectionSuccess && !hasAdAccount) {
      issues.push("No ad account selected. Please select an ad account.");
    }
    
    if (isAuthenticated && apiConnectionSuccess && hasAdAccount && !campaignLoadSuccess) {
      const errorInfo = localStorage.getItem('last_campaign_fetch_error');
      let errorDetails = '';
      
      try {
        if (errorInfo) {
          const errorObj = JSON.parse(errorInfo);
          if (errorObj.message) {
            errorDetails = `: ${errorObj.message}`;
          }
        }
      } catch (e) {
        // Parsing error, just continue without details
      }
      
      issues.push(`Failed to load campaign data${errorDetails}`);
    }
    
    if (isAuthenticated && apiConnectionSuccess && hasAdAccount && campaignLoadSuccess && !hasCampaigns) {
      issues.push("Your account is properly connected, but no campaigns were found in this ad account.");
    }
    
    if (isAuthenticated && diagnosticResults?.cors?.hasCorsIssues && 
        diagnosticResults?.token?.source === 'facebook') {
      issues.push("CORS issues detected even with Facebook authentication. This may indicate browser security settings or network restrictions.");
    }
    
    return issues.length > 0 ? issues : ["No issues detected. If you're still experiencing problems, try refreshing your connection or your browser."];
  };

  const getRecommendedSolutions = () => {
    const solutions = [];
    
    if (!isAuthenticated) {
      solutions.push("Reconnect your Meta account using the Facebook Login button");
      solutions.push("Check that your browser isn't blocking third-party cookies");
    }
    
    if (isAuthenticated && !hasRequiredPermissions) {
      solutions.push("Generate a new token with ads_read and ads_management permissions");
      solutions.push("Check your Business Manager permissions for this ad account");
    }
    
    if (diagnosticResults?.cors?.hasCorsIssues) {
      solutions.push("Use Facebook authentication which helps bypass CORS restrictions");
      solutions.push("Try using a different browser or disabling any privacy extensions");
      solutions.push("Check if your network is blocking Meta domains (corporate networks often do this)");
    }
    
    if (isAuthenticated && apiConnectionSuccess && !hasAdAccount) {
      solutions.push("Select an ad account from the dropdown in the troubleshooter");
    }
    
    if (isAuthenticated && apiConnectionSuccess && hasAdAccount && !campaignLoadSuccess) {
      solutions.push("Wait a few minutes and try again (Meta may have rate-limited your requests)");
      solutions.push("Check network connectivity and any security software that might be blocking requests");
      solutions.push("Try reconnecting your Meta account with fresh authentication");
    }
    
    if (isAuthenticated && apiConnectionSuccess && hasAdAccount && campaignLoadSuccess && !hasCampaigns) {
      solutions.push("Select a different ad account that contains campaigns");
      solutions.push("Create a new campaign in this ad account");
    }
    
    if (solutions.length === 0) {
      solutions.push("Try refreshing the page and clearing your browser cache");
      solutions.push("Reconnect your Meta account to get a fresh token");
    }
    
    return solutions;
  };

  const getObfuscatedToken = () => {
    const token = localStorage.getItem('meta_access_token') || '';
    if (token.length < 10) return 'Invalid token';
    return `${token.slice(0, 5)}...${token.slice(-5)} (${token.length} chars)`;
  };

  const lastEndpoint = localStorage.getItem('last_campaign_fetch_url') || 
    'https://graph.facebook.com/v19.0/';

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString('en-US', {
      timeZoneName: 'short',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Authentication</span>
          <div className="flex items-center">
            {getStatusIcon(isAuthenticated)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Permissions</span>
          <div className="flex items-center">
            {getStatusIcon(hasRequiredPermissions)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">API Connection</span>
          <div className="flex items-center">
            {getStatusIcon(apiConnectionSuccess)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Ad Account</span>
          <div className="flex items-center">
            {getStatusIcon(hasAdAccount)}
          </div>
        </div>
        
        {isAuthenticated && apiConnectionSuccess && hasAdAccount && (
          <>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Data Loading</span>
              <div className="flex items-center">
                {getStatusIcon(campaignLoadSuccess)}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">Has Campaigns</span>
              <div className="flex items-center">
                {getStatusIcon(hasCampaigns)}
              </div>
            </div>
          </>
        )}
      </div>
      
      <Separator />
      
      <div className="bg-gray-50 p-3 rounded-md text-xs space-y-2 font-mono">
        <h4 className="font-medium flex items-center gap-1 text-gray-700 mb-2">
          <Globe className="h-3.5 w-3.5" />
          API Request Details
        </h4>
        
        <p className="text-gray-600">
          <span className="text-gray-500">🔍 Last API Call:</span>{' '}
          <span className="break-all">{lastEndpoint}</span>
        </p>
        
        <p className="text-gray-600">
          <span className="text-gray-500">🔐 Token:</span>{' '}
          {getObfuscatedToken()}
        </p>
        
        <p className="text-gray-600">
          <span className="text-gray-500">🕒 Last Attempt:</span>{' '}
          {formatTimestamp(localStorage.getItem('last_campaign_fetch_attempt'))}
        </p>

        {diagnosticResults?.api?.headers && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-gray-500 mb-1">Response Headers:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(diagnosticResults.api.headers, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
          Issues Detected:
        </h3>
        <ul className="space-y-2">
          {getIssuesList().map((issue, index) => (
            <li key={index} className="text-sm flex gap-2">
              <div className="mt-1 flex-shrink-0">
                {issue.includes("No issues") ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-1" />
            Recommended Solutions:
          </h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {getRecommendedSolutions().map((solution, index) => (
              <li key={index}>{solution}</li>
            ))}
          </ul>
        </div>
        
        {isAuthenticated && apiConnectionSuccess && hasAdAccount && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500 mt-0.5" />
              <h3 className="text-sm font-medium">Campaign Data Details:</h3>
            </div>
            <div className="text-sm pl-6 space-y-1">
              <p>Selected Ad Account: {localStorage.getItem('selected_ad_account')}</p>
              <p>Last Fetch Success: {campaignLoadSuccess ? 'Yes' : 'No'}</p>
              <p>Campaign Count: {localStorage.getItem('last_campaign_count') || '0'}</p>
              {!campaignLoadSuccess && (
                <div className="text-red-600">
                  <p className="font-medium">Fetch Error:</p>
                  <p className="text-xs break-all">{localStorage.getItem('last_campaign_fetch_error') || 'Unknown error'}</p>
                </div>
              )}
              {campaignLoadSuccess && !hasCampaigns && (
                <div className="bg-amber-100 p-2 border border-amber-200 rounded mt-2">
                  <p className="font-medium text-amber-800">No campaigns in this ad account</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Your connection is working, but this ad account has no campaigns. 
                    Try selecting a different ad account or create a new campaign.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Collapsible className="mt-4 border rounded-md overflow-hidden">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 w-full justify-between p-3">
              <span className="flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                Detailed Diagnostic Information
              </span>
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3 bg-gray-50 border-t">
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-gray-500" />
                  Network Requests
                </h4>
                <div className="mt-1 space-y-1">
                  <p>• Check for any blocked API requests in your browser's developer tools (F12 → Network tab).</p>
                  <p>• Look for 401/403 errors which indicate permission issues.</p>
                  <p>• Filter for "graph.facebook.com" requests to see Meta API calls.</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-gray-500" />
                  Meta API Status
                </h4>
                <div className="mt-1 space-y-1">
                  <p>API status code: {diagnosticResults?.api?.statusCode || 'Not available'}</p>
                  <p>Last API check: {diagnosticResults?.timestamp ? 
                    new Date(diagnosticResults.timestamp).toLocaleTimeString() : 
                    'Not available'}</p>
                  {diagnosticResults?.api?.error && (
                    <div className="bg-red-50 p-1 rounded border border-red-100 break-all">
                      {JSON.stringify(diagnosticResults.api.error)}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-gray-500" />
                  Token Information
                </h4>
                <div className="mt-1 space-y-1">
                  <p>Token age: {diagnosticResults?.tokenAnalysis?.age || 'Unknown'} days</p>
                  <p>Token source: {diagnosticResults?.token?.tokenSource || localStorage.getItem('meta_token_source') || 'Unknown'}</p>
                  <p>Has ads_read permission: {diagnosticResults?.token?.hasAdsRead ? 'Yes' : 'No'}</p>
                  <p>Has ads_management permission: {diagnosticResults?.token?.hasAdsManagement ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-gray-500" />
                  Data Loading Analysis
                </h4>
                <div className="mt-1 space-y-1">
                  <p>Last fetch attempt: {localStorage.getItem('last_campaign_fetch_attempt') || 'Unknown'}</p>
                  <p>Browser: {diagnosticResults?.browser?.userAgent || navigator.userAgent}</p>
                  <p>CORS issues detected: {diagnosticResults?.cors?.hasCorsIssues ? 'Yes' : 'No'}</p>
                  {diagnosticResults?.cors?.hasCorsIssues && (
                    <div className="bg-amber-50 p-1 rounded border border-amber-100">
                      CORS issues can prevent API requests from completing. Using Facebook login helps bypass this issue.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2">
                <h4 className="font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  Common Causes for Data Not Loading
                </h4>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>
                    <span className="font-medium">API Rate Limiting:</span> Meta may temporarily limit API calls. Wait a few minutes and try again.
                  </li>
                  <li>
                    <span className="font-medium">Token Expiration:</span> Meta tokens expire after 60 days. Reconnect if your token is old.
                  </li>
                  <li>
                    <span className="font-medium">Permission Changes:</span> Ad account permissions may have been revoked. Check your Business Manager.
                  </li>
                  <li>
                    <span className="font-medium">Ad Account Limitations:</span> Some accounts may have restrictions imposed by Meta.
                  </li>
                  <li>
                    <span className="font-medium">Browser Issues:</span> Try using a different browser or clearing your cache.
                  </li>
                  <li>
                    <span className="font-medium">Network Issues:</span> Check your internet connection or try using a different network.
                  </li>
                </ul>
              </div>

              <div className="mt-3">
                <h4 className="font-medium">Quick Fixes</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh Page
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => {
                      localStorage.removeItem('selected_ad_account');
                      window.location.reload();
                    }}
                  >
                    <Database className="h-3 w-3 mr-1" />
                    Reset Ad Account
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => {
                      localStorage.setItem('show_meta_connection', 'true');
                      window.location.reload();
                    }}
                  >
                    Reconnect Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => {
                      localStorage.removeItem('last_campaign_fetch_attempt');
                      localStorage.removeItem('last_campaign_fetch_success');
                      localStorage.removeItem('last_campaign_fetch_error');
                      localStorage.removeItem('last_campaign_count');
                      window.location.reload();
                    }}
                  >
                    Clear Cache & Reload
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default DiagnosticResults;
