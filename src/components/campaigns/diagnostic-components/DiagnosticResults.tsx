
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, XCircle, Database, Search, ArrowDownToLine } from 'lucide-react';
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

  // Verify authentication status based on token validity
  const isAuthenticated = diagnosticResults?.token?.hasToken && 
                          diagnosticResults?.tokenAnalysis?.isValid !== false &&
                          diagnosticResults?.token?.tokenLength > 50;

  // Check permissions based on token data
  const hasRequiredPermissions = diagnosticResults?.token?.hasAdsRead || 
                                diagnosticResults?.token?.hasAdsManagement;
                              
  // Check API connection
  const apiConnectionSuccess = diagnosticResults?.api?.success === true;
  
  // Check ad account selection
  const hasAdAccount = !!localStorage.getItem('selected_ad_account');
  
  // Check campaign data loading
  const campaignLoadSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  // Check if campaigns exist
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
    
    return issues.length > 0 ? issues : ["No issues detected. If you're still experiencing problems, try refreshing your connection or your browser."];
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
      
      <div>
        <h3 className="text-sm font-medium mb-2">Issues & Solutions:</h3>
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
        
        {/* Only show recommendations if there are actual issues */}
        {diagnosticResults && getIssuesList()[0] !== "No issues detected. If you're still experiencing problems, try refreshing your connection or your browser." && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Recommended Actions:</h3>
            {diagnosticResults.summary && diagnosticResults.summary.recommendations && diagnosticResults.summary.recommendations.length > 0 ? (
              <ul className="list-decimal pl-4 text-sm">
                {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No specific recommendations available.</p>
            )}
          </div>
        )}
        
        {/* Campaign data details section */}
        {isAuthenticated && apiConnectionSuccess && hasAdAccount && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start mb-2">
              <Database className="h-4 w-4 text-blue-500 mr-2 mt-1" />
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

        {/* NEW: Advanced Troubleshooting Section */}
        <Collapsible className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 w-full justify-between">
              <span className="flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                Advanced Troubleshooting
              </span>
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 p-3 border rounded-md">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Diagnostic Information</h4>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Network Requests:</p>
                    <p>Check for any blocked API requests in your browser's developer tools (F12 → Network tab).</p>
                    <p>Look for 401/403 errors which indicate permission issues.</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Meta API Status:</p>
                    <p>API status code: {diagnosticResults?.api?.statusCode || 'Not available'}</p>
                    {diagnosticResults?.api?.error && (
                      <p className="text-red-600">API error: {JSON.stringify(diagnosticResults.api.error)}</p>
                    )}
                    <p>Last API check: {diagnosticResults?.timestamp ? new Date(diagnosticResults.timestamp).toLocaleTimeString() : 'Not available'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Token Information:</p>
                    <p>Token age: {diagnosticResults?.tokenAnalysis?.age || 'Unknown'} days</p>
                    <p>Token source: {diagnosticResults?.token?.tokenSource || localStorage.getItem('meta_token_source') || 'Unknown'}</p>
                    <p>Has ads_read permission: {diagnosticResults?.token?.hasAdsRead ? 'Yes' : 'No'}</p>
                    <p>Has ads_management permission: {diagnosticResults?.token?.hasAdsManagement ? 'Yes' : 'No'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Data Loading Analysis:</p>
                    <p>Last fetch attempt: {localStorage.getItem('last_campaign_fetch_attempt') || 'Unknown'}</p>
                    <p>Browser: {diagnosticResults?.browser?.userAgent || navigator.userAgent}</p>
                    <p>CORS issues detected: {diagnosticResults?.cors?.hasCorsIssues ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Common Causes for Data Not Loading</h4>
                <ul className="list-disc pl-4 mt-2 space-y-1 text-xs">
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

              <div>
                <h4 className="text-sm font-medium">Try These Solutions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
                      // Clear caches related to campaign data
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

              <div className="text-xs text-gray-500 italic">
                If problems persist, try selecting a different ad account or check if your Meta Business account has active campaigns.
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default DiagnosticResults;
