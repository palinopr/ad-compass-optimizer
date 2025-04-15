
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, AlertCircle, RefreshCw, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

interface CampaignFetchStatusProps {
  campaigns: any[];
  isLoading: boolean;
  error: string | null;
}

const CampaignFetchStatus: React.FC<CampaignFetchStatusProps> = ({ 
  campaigns, 
  isLoading, 
  error 
}) => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [lastManualFetchTime, setLastManualFetchTime] = useState<string | null>(null);
  const [lastFetchAccountId, setLastFetchAccountId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  
  // Function to force a fetch refresh with bypass throttling
  const forceFetch = () => {
    try {
      console.log('[CAMPAIGN FETCH] 🚀 Manual refresh triggered with bypass throttling');
      
      // Ensure we're not in mock mode
      localStorage.removeItem('USE_MOCK_MODE');
      localStorage.removeItem('mock_campaigns_data');
      
      // Force refresh with true parameter to bypass throttling
      triggerCampaignRefresh(true, undefined, true);
      
      // Update the UI immediately to show activity
      setLastManualFetchTime(new Date().toISOString());
      setFetchAttempts(prev => prev + 1);
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error triggering manual refresh:', e);
    }
  };
  
  useEffect(() => {
    // Load fetch history from local storage
    const loadFetchHistory = () => {
      const storedFetchTime = localStorage.getItem('last_campaign_fetch_attempt');
      const manualFetchTime = localStorage.getItem('last_manual_campaign_fetch');
      const storedAttempts = localStorage.getItem('campaign_fetch_attempts');
      const storedError = localStorage.getItem('last_campaign_fetch_error');
      const storedHeaders = localStorage.getItem('last_campaign_fetch_headers');
      
      if (storedFetchTime) {
        setLastFetchTime(storedFetchTime);
      }
      
      if (manualFetchTime) {
        setLastManualFetchTime(manualFetchTime);
      }
      
      if (storedAttempts) {
        setFetchAttempts(parseInt(storedAttempts, 10));
      }
      
      if (storedError) {
        try {
          setErrorDetails(JSON.parse(storedError));
        } catch (e) {
          console.error('Error parsing stored error:', e);
        }
      }
      
      if (storedHeaders) {
        try {
          setResponseHeaders(JSON.parse(storedHeaders));
        } catch (e) {
          console.error('Error parsing stored headers:', e);
        }
      }
      
      const storedAccount = localStorage.getItem('last_campaign_fetch_account');
      if (storedAccount) {
        setLastFetchAccountId(storedAccount);
      }
    };
    
    // Initial load
    loadFetchHistory();
    
    // Set up a timer to periodically refresh from localStorage
    const refreshTimer = setInterval(loadFetchHistory, 2000);
    
    // Listen for campaign fetch events
    const handleFetchAttempt = (event: CustomEvent<{accountId?: string}>) => {
      console.log('[CAMPAIGN FETCH] Fetch attempt event detected');
      
      // Force refresh from localStorage
      loadFetchHistory();
      
      if (event.detail?.accountId) {
        setLastFetchAccountId(event.detail.accountId);
      }
    };
    
    window.addEventListener('campaign-fetch-log', handleFetchAttempt as EventListener);
    window.addEventListener('campaign-fetch-attempt', handleFetchAttempt as EventListener);
    window.addEventListener('campaign-refresh', () => {
      console.log('[CAMPAIGN FETCH] Refresh event detected, updating UI');
      loadFetchHistory();
    });
    
    return () => {
      clearInterval(refreshTimer);
      window.removeEventListener('campaign-fetch-log', handleFetchAttempt as EventListener);
      window.removeEventListener('campaign-fetch-attempt', handleFetchAttempt as EventListener);
    };
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-blue-600" />
            Campaign Fetch Status
          </div>
          <StatusBadge isLoading={isLoading} error={error} campaigns={campaigns} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Campaigns:</span>
            <span className="text-sm font-mono">{campaigns.length}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Fetch attempts:</span>
            <span className="text-sm font-mono">{fetchAttempts}</span>
          </div>
          
          {lastFetchAccountId && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last account:</span>
              <span className="text-sm font-mono truncate max-w-[150px]">{lastFetchAccountId}</span>
            </div>
          )}
          
          {lastManualFetchTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Manual Fetch:</span>
              <span className="text-sm">{formatTime(lastManualFetchTime)}</span>
            </div>
          )}
          
          {lastFetchTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Auto Fetch:</span>
              <span className="text-sm">{formatTime(lastFetchTime)}</span>
            </div>
          )}

          <div className="mt-2">
            <Button 
              onClick={forceFetch}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="w-full flex gap-2 items-center justify-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Force Fetch Now (Bypass Throttle)
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-xs mt-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Fetching campaigns...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Enhanced error details */}
          {errorDetails && (
            <div className="mt-3 text-xs border border-red-200 rounded-md p-2 bg-red-50">
              <h4 className="font-medium text-red-700 mb-1">Error Details:</h4>
              
              {errorDetails.status && (
                <div className="flex justify-between">
                  <span className="text-red-800">HTTP Status:</span>
                  <span className="font-mono">{errorDetails.status}</span>
                </div>
              )}
              
              {errorDetails.message && (
                <div className="flex flex-col mt-1">
                  <span className="text-red-800">Message:</span>
                  <span className="font-mono text-xs break-words">{errorDetails.message}</span>
                </div>
              )}
              
              {(errorDetails.code || errorDetails.details?.code) && (
                <div className="flex justify-between mt-1">
                  <span className="text-red-800">Error Code:</span>
                  <span className="font-mono">{errorDetails.code || errorDetails.details?.code}</span>
                </div>
              )}
              
              {(errorDetails.type || errorDetails.details?.type) && (
                <div className="flex justify-between mt-1">
                  <span className="text-red-800">Error Type:</span>
                  <span className="font-mono">{errorDetails.type || errorDetails.details?.type}</span>
                </div>
              )}
              
              {errorDetails.timestamp && (
                <div className="flex justify-between mt-1">
                  <span className="text-red-800">Time:</span>
                  <span>{formatTime(errorDetails.timestamp)}</span>
                </div>
              )}
              
              {(errorDetails.fbTraceId || errorDetails.details?.fbTraceId) && (
                <div className="flex justify-between mt-1">
                  <span className="text-red-800">FB Trace:</span>
                  <span className="font-mono text-xs truncate">{errorDetails.fbTraceId || errorDetails.details?.fbTraceId}</span>
                </div>
              )}
              
              {errorDetails.rawResponse && (
                <div className="flex flex-col mt-2">
                  <span className="text-red-800">Raw Response:</span>
                  <pre className="font-mono text-[10px] mt-1 bg-red-100 p-1 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                    {typeof errorDetails.rawResponse === 'string' 
                      ? errorDetails.rawResponse.substring(0, 500) + (errorDetails.rawResponse.length > 500 ? '...' : '') 
                      : JSON.stringify(errorDetails.rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Display API headers for debugging */}
          {responseHeaders && Object.keys(responseHeaders).length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-md p-2 bg-gray-50 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">API Headers:</h4>
                <Badge variant="outline" className="text-[10px] h-4">debug</Badge>
              </div>
              {Object.entries(responseHeaders).map(([key, value]: [string, any]) => (
                <div key={key} className="flex flex-col mt-1">
                  <span className="text-gray-500 text-[10px]">{key}:</span>
                  <span className="font-mono text-[10px] break-words truncate">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ isLoading, error, campaigns }: { 
  isLoading: boolean;
  error: string | null;
  campaigns: any[];
}) => {
  if (isLoading) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Loading...
      </Badge>
    );
  }
  
  if (error) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        Failed
      </Badge>
    );
  }
  
  if (campaigns.length > 0) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Loaded ({campaigns.length})
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      Empty
    </Badge>
  );
};

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } catch (e) {
    return 'Invalid time';
  }
};

export default CampaignFetchStatus;
