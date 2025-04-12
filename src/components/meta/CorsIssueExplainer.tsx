
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Server, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CorsIssueExplainerProps {
  onTryProxy?: () => void;
  corsProxyTested?: boolean;
  proxyError?: string;
}

const CorsIssueExplainer: React.FC<CorsIssueExplainerProps> = ({ 
  onTryProxy,
  corsProxyTested,
  proxyError
}) => {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Shield className="h-5 w-5 mr-2 text-yellow-500" />
          Understanding CORS Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm">
            <strong>What is CORS?</strong> Cross-Origin Resource Sharing (CORS) is a security feature that prevents 
            websites from making requests to a different domain than the one that served the web page.
          </p>
          
          <div className="flex items-center space-x-3 text-sm py-2">
            <div className="flex flex-col items-center">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="mt-1">Your App</span>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-red-400 relative">
              <AlertTriangle className="h-5 w-5 text-red-500 absolute top-[-12px] left-1/2 transform -translate-x-1/2" />
              <div className="absolute top-[-28px] left-1/2 transform -translate-x-1/2 text-xs text-red-600">
                CORS Error
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Server className="h-6 w-6 text-gray-500" />
              <span className="mt-1">Meta API</span>
            </div>
          </div>
          
          <h3 className="font-medium text-sm">Why am I seeing this?</h3>
          <p className="text-sm">
            Most APIs, including Meta's, have CORS restrictions for security reasons. In development,
            this prevents your browser from making direct API requests.
          </p>
          
          <h3 className="font-medium text-sm">Solutions:</h3>
          <ul className="list-disc pl-5 text-sm">
            <li>Use browser extensions like "CORS Unblock" or "Allow CORS" for testing</li>
            <li>Implement a server-side proxy in your application</li>
            <li>Continue using the browser login flow (which handles CORS automatically)</li>
          </ul>
          
          <h3 className="font-medium text-sm">Production Applications:</h3>
          <p className="text-sm">
            For production applications, you should implement a proper server-side proxy to handle API calls securely.
            This is the recommended approach for handling sensitive operations like API calls with tokens.
          </p>
          
          {onTryProxy && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Test a Proxy Solution:</h4>
              {corsProxyTested ? (
                <div className="text-sm mb-2">
                  <p className="text-red-600">{proxyError || "Proxy test failed"}</p>
                  <p className="mt-1">
                    The CORS proxy test failed. This could be because:
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-xs">
                    <li>The proxy service requires temporary access approval</li>
                    <li>The proxy service has rate limits that were exceeded</li>
                    <li>The proxy service is currently unavailable</li>
                  </ul>
                </div>
              ) : null}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onTryProxy}
                className="mt-2"
              >
                Test CORS Proxy
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CorsIssueExplainer;
