
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ApiCall {
  timestamp: string;
  url: string;
  method: string;
  params?: any;
  response?: any;
  error?: any;
}

const MetaApiCallLogs = () => {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to capture API calls
  useEffect(() => {
    // Create a container to store API call logs
    if (!window.metaApiCalls) {
      window.metaApiCalls = [];
    }

    // Get initial calls
    setApiCalls(window.metaApiCalls || []);

    // Listen for new API call events
    const handleApiCall = (event: CustomEvent) => {
      const newCall = event.detail;
      if (newCall) {
        console.log('New Meta API call captured:', newCall);
        setApiCalls(prev => [newCall, ...prev].slice(0, 10)); // Keep only the most recent 10 calls
      }
    };

    window.addEventListener('meta-api-call', handleApiCall as EventListener);
    
    return () => {
      window.removeEventListener('meta-api-call', handleApiCall as EventListener);
    };
  }, []);

  const refreshLogs = () => {
    setIsLoading(true);
    // Short delay to simulate refresh
    setTimeout(() => {
      setApiCalls(window.metaApiCalls || []);
      setIsLoading(false);
    }, 300);
  };

  if (apiCalls.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Code className="w-4 h-4 mr-2 text-blue-600" />
              Meta API Call Logs
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshLogs}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 pt-0">
          No API calls captured yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Code className="w-4 h-4 mr-2 text-blue-600" />
            Meta API Call Logs ({apiCalls.length})
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshLogs}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="h-6 w-6 p-0"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 text-xs">
          {apiCalls.slice(0, expanded ? undefined : 3).map((call, index) => (
            <div key={index} className="border rounded-md p-2">
              <div className="font-mono font-medium mb-1 flex justify-between">
                <span className="text-gray-600">{new Date(call.timestamp).toLocaleTimeString()}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  call.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {call.method || 'GET'}
                </span>
              </div>
              <div className="font-mono truncate text-xs mb-1" title={call.url}>
                {call.url}
              </div>
              
              {call.error ? (
                <div className="bg-red-50 rounded p-1.5 mt-1">
                  <div className="text-red-700 font-medium">Error:</div>
                  <div className="text-red-600 overflow-auto max-h-20">
                    {typeof call.error === 'object' 
                      ? JSON.stringify(call.error, null, 2) 
                      : call.error}
                  </div>
                </div>
              ) : call.response ? (
                <div className="bg-gray-50 rounded p-1.5 mt-1">
                  <div className="text-gray-700 font-medium">Response:</div>
                  <div className="text-gray-600 overflow-auto max-h-20">
                    {typeof call.response === 'object' 
                      ? `${Object.keys(call.response).join(', ')}`
                      : String(call.response).substring(0, 100)}
                  </div>
                  {call.response && typeof call.response === 'object' && 'data' in call.response && (
                    <div className="mt-1 text-green-600">
                      Items: {Array.isArray(call.response.data) ? call.response.data.length : 'N/A'}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}

          {apiCalls.length > 3 && !expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setExpanded(true)}
            >
              Show {apiCalls.length - 3} more calls
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaApiCallLogs;
