
import React, { useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import ConnectionStatusSummary from './connection-status/ConnectionStatusSummary';
import Troubleshooting from './connection-status/Troubleshooting';
import NextSteps from './connection-status/NextSteps';
import DebugInfo from './connection-status/DebugInfo';
import { Button } from '@/components/ui/button';
import { Bug, Code, AlertTriangle } from 'lucide-react';
import { runTokenDiagnostic } from '@/utils/metaTokenDiagnostic';
import { testMetaApi, checkForCorsIssues } from '@/utils/metaApiTest';

interface ConnectionStatusPanelProps {
  isAuthenticated: boolean;
  adAccounts: any[];
  onRetryConnection?: () => void;
  onConnectWithBrowser?: () => void;
}

const ConnectionStatusPanel: React.FC<ConnectionStatusPanelProps> = ({ 
  isAuthenticated, 
  adAccounts,
  onRetryConnection,
  onConnectWithBrowser
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  
  // Get token freshness information
  const tokenInfo = isAuthenticated ? metaAuthService.checkTokenFreshness() : { isFresh: false, age: 0 };
  
  // Get permission information
  const hasAdPermissions = isAuthenticated ? metaAuthService.hasAdAccountPermissions() : false;
  const permissions = isAuthenticated ? metaAuthService.getPermissions() : [];
  
  // Get token information
  const token = metaAuthService.getAccessToken();
  const tokenExists = !!token && token.length > 20;
  const tokenSource = metaAuthService.getTokenSource() || 'unknown';
  const userId = metaAuthService.getUserId() || 'unknown';

  // Calculate days until token expiry
  const daysUntilExpiry = isAuthenticated ? Math.max(0, 60 - tokenInfo.age) : 0;

  const handleRunDiagnostic = () => {
    setIsRunningTest(true);
    const results = runTokenDiagnostic();
    setDiagnosticResults(results);
    setShowDiagnostics(true);
    setIsRunningTest(false);
  };

  const handleApiTest = async () => {
    setIsRunningTest(true);
    const results = await testMetaApi();
    setDiagnosticResults(results);
    setShowDiagnostics(true);
    setIsRunningTest(false);
  };

  const handleCorsCheck = async () => {
    setIsRunningTest(true);
    const results = await checkForCorsIssues();
    setDiagnosticResults(results);
    setShowDiagnostics(true);
    setIsRunningTest(false);
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Connection Status</h3>
      
      <div className="space-y-4">
        {/* Connection Status Summary */}
        <ConnectionStatusSummary
          isAuthenticated={isAuthenticated}
          adAccounts={adAccounts}
          tokenInfo={tokenInfo}
          daysUntilExpiry={daysUntilExpiry}
          hasAdPermissions={hasAdPermissions}
          permissions={permissions}
        />
        
        {/* Connection Troubleshooting Section */}
        {!isAuthenticated && (
          <Troubleshooting
            tokenExists={tokenExists}
            onRetryConnection={onRetryConnection}
            onConnectWithBrowser={onConnectWithBrowser}
          />
        )}
        
        {/* Next Steps for Authenticated Users without Ad Accounts */}
        {isAuthenticated && adAccounts.length === 0 && <NextSteps />}
        
        {/* Debug information for developers - hidden in production */}
        <DebugInfo
          tokenSource={tokenSource}
          userId={userId}
          tokenExists={tokenExists}
          tokenLength={token?.length}
        />

        {/* Diagnostic Tools */}
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <Bug className="h-4 w-4 mr-1" /> 
              Diagnostic Tools
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
            >
              {showDiagnostics ? "Hide" : "Show"} Tools
            </Button>
          </div>

          {showDiagnostics && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRunDiagnostic}
                  disabled={isRunningTest}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Token Diagnostic
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleApiTest}
                  disabled={isRunningTest || !tokenExists}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  API Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCorsCheck}
                  disabled={isRunningTest || !tokenExists}
                >
                  <Bug className="h-3 w-3 mr-1" />
                  CORS Check
                </Button>
              </div>

              {diagnosticResults && (
                <div className="bg-gray-100 p-3 rounded-md">
                  <h5 className="font-medium text-xs mb-1">Diagnostic Results:</h5>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(diagnosticResults, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;
