
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Wifi, AlertCircle, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ConnectionTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const ConnectionTab: React.FC<ConnectionTabProps> = ({ diagnosticResults }) => {
  const apiStatus = diagnosticResults?.api?.success || false;
  const corsIssues = diagnosticResults?.cors?.hasCorsIssues || false;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Meta API Connection
          </h3>
          
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${apiStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>API Connection: {apiStatus ? 'Connected' : 'Disconnected'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${corsIssues ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span>CORS Issues: {corsIssues ? 'Detected' : 'None detected'}</span>
            </div>
            
            {apiStatus ? (
              <div className="bg-green-50 p-2 rounded border border-green-100 mt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">API connection healthy</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-2 rounded border border-red-100 mt-2">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-red-700">API Connection Issue</h5>
                    <p className="text-xs text-red-600 mt-0.5">
                      {diagnosticResults?.api?.error?.message || 'Unable to connect to Meta API'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API Call Optimization
          </h3>
          
          <div className="mt-3 space-y-3 text-sm">
            <p className="text-gray-600">
              Meta's API has strict rate limits. Here's how this application optimizes API usage:
            </p>
            
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Implements debouncing to prevent repeated calls</li>
              <li>Uses local caching to reduce API requests</li>
              <li>Detects and handles rate limiting gracefully</li>
              <li>Prevents concurrent API calls</li>
              <li>Shows cached data during rate limiting periods</li>
            </ul>
            
            <div className="bg-amber-50 p-3 rounded border border-amber-100">
              <h4 className="font-medium mb-1 text-amber-800">Recommendations to prevent rate limiting:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-700">
                <li>Wait at least 5 minutes between page refreshes</li>
                <li>Use the cached data option when available</li>
                <li>Select a single ad account and stick with it</li>
                <li>Use the troubleshooter instead of refreshing the page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionTab;
