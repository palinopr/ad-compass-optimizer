
import React, { useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import ConnectionStatusSummary from './connection-status/ConnectionStatusSummary';
import Troubleshooting from './connection-status/Troubleshooting';
import NextSteps from './connection-status/NextSteps';
import DebugInfo from './connection-status/DebugInfo';
import { Button } from '@/components/ui/button';
import { Bug, Code, AlertTriangle, Stethoscope, Globe, Shield } from 'lucide-react';
import { runTokenDiagnostic } from '@/utils/metaTokenDiagnostic';
import { 
  testMetaApi, 
  checkForCorsIssues, 
  runComprehensiveDiagnostic, 
  testProxyApproach,
  testBrowserCompatibility
} from '@/utils/metaApiTest';

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
  const [isRunningComprehensiveDiagnostic, setIsRunningComprehensiveDiagnostic] = useState(false);
  const [proxyTestResult, setProxyTestResult] = useState<any>(null);
  
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

  const handleComprehensiveDiagnostic = async () => {
    setIsRunningComprehensiveDiagnostic(true);
    setShowDiagnostics(true);
    const results = await runComprehensiveDiagnostic();
    setDiagnosticResults(results);
    setIsRunningComprehensiveDiagnostic(false);
  };

  const handleTestProxy = async () => {
    setIsRunningTest(true);
    const results = await testProxyApproach();
    setProxyTestResult(results);
    setShowDiagnostics(true);
    setIsRunningTest(false);
  };

  const handleBrowserCompatibility = () => {
    setIsRunningTest(true);
    const results = testBrowserCompatibility();
    setDiagnosticResults(results);
    setShowDiagnostics(true);
    setIsRunningTest(false);
  };

  // Determine if there are CORS issues based on diagnostic results
  const hasCorsIssues = diagnosticResults?.cors?.hasCorsIssues || false;

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
                  disabled={isRunningTest || isRunningComprehensiveDiagnostic}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Token Diagnostic
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleApiTest}
                  disabled={isRunningTest || isRunningComprehensiveDiagnostic || !tokenExists}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  API Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCorsCheck}
                  disabled={isRunningTest || isRunningComprehensiveDiagnostic || !tokenExists}
                >
                  <Bug className="h-3 w-3 mr-1" />
                  CORS Check
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBrowserCompatibility}
                  disabled={isRunningTest || isRunningComprehensiveDiagnostic}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Browser Check
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleComprehensiveDiagnostic}
                  disabled={isRunningTest || isRunningComprehensiveDiagnostic}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Lovable Diagnostic
                </Button>
              </div>

              {diagnosticResults && (
                <div className="bg-gray-100 p-3 rounded-md">
                  <h5 className="font-medium text-xs mb-1">Diagnostic Results:</h5>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(diagnosticResults, null, 2)}
                  </pre>
                  
                  {/* Display comprehensive diagnostic results in a more readable format */}
                  {diagnosticResults.summary && (
                    <div className="mt-3 border-t pt-2">
                      <h5 className="font-medium text-sm">
                        Summary
                        <span 
                          className={`ml-2 px-2 py-0.5 rounded text-xs ${
                            diagnosticResults.summary.overallStatus === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : diagnosticResults.summary.overallStatus === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {diagnosticResults.summary.overallStatus === 'high' 
                            ? 'Critical Issues' 
                            : diagnosticResults.summary.overallStatus === 'medium'
                            ? 'Issues Found'
                            : 'All Good'}
                        </span>
                      </h5>
                      
                      {diagnosticResults.summary.issues.length > 0 && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium">Issues:</h6>
                          <ul className="list-disc pl-5 text-xs space-y-0.5">
                            {diagnosticResults.summary.issues.map((issue: string, i: number) => (
                              <li key={i} className="text-gray-700">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {diagnosticResults.summary.recommendations.length > 0 && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium">Recommendations:</h6>
                          <ul className="list-disc pl-5 text-xs space-y-0.5">
                            {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="text-gray-700">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show CORS troubleshooting info if CORS issues detected */}
                  {hasCorsIssues && (
                    <div className="mt-3 border-t pt-2">
                      <h5 className="font-medium text-xs mb-1 flex items-center">
                        <Shield className="h-3 w-3 mr-1 text-red-600" />
                        CORS Issue Detected
                      </h5>

                      <div className="bg-red-50 border border-red-100 rounded p-2 mb-2">
                        <p className="text-xs text-red-700">
                          Your browser's security settings are preventing direct API calls to Meta.
                          This is a common issue when developing apps that use external APIs.
                        </p>
                      </div>

                      <h6 className="text-xs font-medium mt-2">Possible Solutions:</h6>
                      <ol className="list-decimal pl-5 text-xs space-y-0.5 mb-3">
                        <li>Try a browser extension like "Allow CORS" or "CORS Unblock"</li>
                        <li>Use a different browser</li>
                        <li>Implement a server-side proxy in your application</li>
                        <li>Continue using the application with Facebook browser login (this bypasses the CORS issue)</li>
                      </ol>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestProxy}
                        disabled={isRunningTest}
                        className="text-xs"
                      >
                        Test Proxy Approach
                      </Button>

                      {proxyTestResult && (
                        <div className="mt-2 text-xs">
                          <p className={`font-medium ${proxyTestResult.proxyWorked ? 'text-green-600' : 'text-red-600'}`}>
                            {proxyTestResult.proxyWorked 
                              ? '✓ Proxy approach works!' 
                              : '✗ Proxy approach failed'}
                          </p>
                          {proxyTestResult.error && (
                            <p className="text-red-600 mt-1">{proxyTestResult.error}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {isRunningComprehensiveDiagnostic && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                  <span>Running comprehensive diagnostic...</span>
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
