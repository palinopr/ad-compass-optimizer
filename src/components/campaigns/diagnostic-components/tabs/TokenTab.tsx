
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Key, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import TokenDetails from '../TokenDetails';

interface TokenTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const TokenTab: React.FC<TokenTabProps> = ({ diagnosticResults, runDiagnostic }) => {
  const tokenInfo = diagnosticResults?.token || {
    hasToken: false
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Meta API Token
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs flex items-center gap-1.5"
              onClick={() => {
                localStorage.removeItem('meta_auth_checked');
                runDiagnostic();
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Token Status
            </Button>
          </div>
          
          <Separator className="my-3" />
          
          <TokenDetails 
            tokenInfo={tokenInfo}
            tokenAnalysis={diagnosticResults?.tokenAnalysis}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            API Call Optimization
          </h3>
          
          <div className="mt-3 space-y-3 text-sm">
            <p>
              Meta API enforces rate limits to prevent spam. The token diagnostics help identify issues 
              that might lead to unnecessary API calls.
            </p>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium mb-2">Detected Token Health:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li className={tokenInfo?.isValid ? "text-green-600" : "text-red-500"}>
                  Token validity: {tokenInfo?.isValid ? "Valid" : "Invalid or expired"}
                </li>
                <li className={tokenInfo?.hasAdsRead ? "text-green-600" : "text-amber-500"}>
                  Has ads_read permission: {tokenInfo?.hasAdsRead ? "Yes" : "No"}
                </li>
                <li className={tokenInfo?.hasAdsManagement ? "text-green-600" : "text-amber-500"}>
                  Has ads_management permission: {tokenInfo?.hasAdsManagement ? "Yes" : "No"}
                </li>
                <li className={tokenInfo?.tokenAge && tokenInfo.tokenAge < 30 ? "text-green-600" : "text-amber-500"}>
                  Token age: {tokenInfo?.tokenAge || "Unknown"} days
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <h4 className="font-medium mb-2 text-blue-800">API Call Best Practices:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-blue-700">
                <li>Avoid refreshing the page frequently</li>
                <li>Use cached data when possible</li>
                <li>Allow 5-10 minutes between API requests</li>
                <li>Monitor network tab for API call frequency</li>
                <li>Use longer-lived tokens to reduce authentication calls</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenTab;
