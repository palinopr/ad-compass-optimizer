
import React, { useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { Button } from '@/components/ui/button';
import { Bug, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface CampaignDebugInfoProps {
  campaigns: MetaCampaign[];
}

const CampaignDebugInfo = ({ campaigns }: CampaignDebugInfoProps) => {
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [errorResponse, setErrorResponse] = useState<any>(null);
  const [showErrorResponse, setShowErrorResponse] = useState(false);
  const [responseMetadata, setResponseMetadata] = useState<any>(null);
  
  // Update debug information
  useEffect(() => {
    loadDebugData();
  }, []);

  const loadDebugData = () => {
    try {
      // Load raw response data
      const storedResponse = localStorage.getItem('raw_campaign_response');
      if (storedResponse) {
        try {
          const parsed = JSON.parse(storedResponse);
          setRawResponse(parsed);
        } catch (e) {
          // If it's not JSON, show as text
          setRawResponse({ text: storedResponse });
        }
      }
      
      // Load error response data
      const storedErrorResponse = localStorage.getItem('raw_campaign_error_response');
      if (storedErrorResponse) {
        try {
          const parsedError = JSON.parse(storedErrorResponse);
          setErrorResponse(parsedError);
          // Auto-show errors
          setShowErrorResponse(true);
        } catch (e) {
          setErrorResponse({ text: storedErrorResponse });
          setShowErrorResponse(true);
        }
      }
      
      // Load response metadata
      const storedMetadata = localStorage.getItem('campaign_response_metadata');
      if (storedMetadata) {
        try {
          setResponseMetadata(JSON.parse(storedMetadata));
        } catch (e) {
          console.error('Error parsing response metadata:', e);
        }
      }
    } catch (e) {
      console.error('Error loading debug data:', e);
    }
  };

  const showRawData = () => {
    loadDebugData();
    setShowRawResponse(true);
  };

  // Only show in development environment or with debug flag
  if (process.env.NODE_ENV === 'production' && !localStorage.getItem('enable_debug')) return null;
  
  return (
    <div className="mt-4 p-2 bg-gray-100 rounded">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs">
          Debug: {campaigns.length} campaigns loaded. 
          {campaigns.length > 0 && `First campaign ID: ${campaigns[0]?.id || 'unknown'}`}
        </span>
        <Button variant="outline" size="sm" onClick={showRawData} className="text-xs h-6 flex items-center">
          <Bug className="h-3 w-3 mr-1" />
          Show Debug Data
        </Button>
      </div>
      
      {errorResponse && (
        <Collapsible open={showErrorResponse} onOpenChange={setShowErrorResponse} className="mb-2">
          <Alert variant="destructive" className="mb-1">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Error detected in campaign fetch: {errorResponse.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
          
          <CollapsibleTrigger className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs flex items-center justify-center">
              <ChevronDown className={`h-3 w-3 mr-1 transform ${showErrorResponse ? 'rotate-180' : ''}`} />
              {showErrorResponse ? 'Hide Error Details' : 'Show Error Details'}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="bg-red-50 border border-red-200 p-2 rounded text-xs">
              <h4 className="font-bold text-red-800 mb-1">Error Details:</h4>
              
              {errorResponse.status && (
                <div className="flex justify-between mt-1">
                  <span className="font-medium">Status:</span>
                  <span>{errorResponse.status} {errorResponse.statusText}</span>
                </div>
              )}
              
              {errorResponse.errorData?.error && (
                <div className="mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Error Code:</span>
                    <span>{errorResponse.errorData.error.code || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Error Type:</span>
                    <span>{errorResponse.errorData.error.type || 'Unknown'}</span>
                  </div>
                  {errorResponse.errorData.error.error_subcode && (
                    <div className="flex justify-between">
                      <span className="font-medium">Subcode:</span>
                      <span>{errorResponse.errorData.error.error_subcode}</span>
                    </div>
                  )}
                  <div className="mt-1">
                    <span className="font-medium">Message:</span>
                    <div className="bg-red-100 p-1 rounded mt-1 break-words">
                      {errorResponse.errorData.error.message || 'No message provided'}
                    </div>
                  </div>
                </div>
              )}
              
              {errorResponse.adAccountId && (
                <div className="flex justify-between mt-2">
                  <span className="font-medium">Ad Account:</span>
                  <span>{errorResponse.adAccountId}</span>
                </div>
              )}
              
              {errorResponse.timestamp && (
                <div className="flex justify-between mt-1">
                  <span className="font-medium">Timestamp:</span>
                  <span>{new Date(errorResponse.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
              
              {errorResponse.requestUrl && (
                <div className="mt-2">
                  <span className="font-medium">Request URL:</span>
                  <div className="bg-gray-100 p-1 rounded mt-1 break-words text-[10px]">
                    {errorResponse.requestUrl}
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Trigger a campaign refresh to retry
                  const event = new CustomEvent('campaign-refresh', { detail: { force: true } });
                  window.dispatchEvent(event);
                }}
                className="mt-3 w-full text-xs flex items-center justify-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Force Campaign Refresh
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {responseMetadata && (
        <div className="mb-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Last API response:</span>
            <span>{responseMetadata.status} {responseMetadata.statusText}</span>
          </div>
        </div>
      )}
      
      {showRawResponse && (
        <div className="mt-2">
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <ChevronDown className="h-3 w-3 mr-1" />
                Raw API Response Data
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-96 text-xs mt-2">
                <pre className="whitespace-pre-wrap">
                  {rawResponse?.error ? 
                    `Error: ${JSON.stringify(rawResponse.error, null, 2)}` : 
                    rawResponse?.text ? 
                      rawResponse.text : 
                      JSON.stringify(rawResponse, null, 2)
                  }
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRawResponse(false)}
            className="mt-2 text-xs w-full"
          >
            Hide Debug Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignDebugInfo;
