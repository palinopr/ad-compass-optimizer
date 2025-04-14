
import React, { useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import ConnectionStatusSummary from './connection-status/ConnectionStatusSummary';
import Troubleshooting from './connection-status/Troubleshooting';
import NextSteps from './connection-status/NextSteps';
import DebugInfo from './connection-status/DebugInfo';
import DiagnosticTools from './diagnostics/DiagnosticTools';
import DiagnosticResults from './diagnostics/DiagnosticResults';
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

  const handleFullPageRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Connection Status</h3>
      
      <div className="space-y-4">
        <ConnectionStatusSummary
          isAuthenticated={isAuthenticated}
          adAccounts={adAccounts}
          tokenInfo={tokenInfo}
          daysUntilExpiry={daysUntilExpiry}
          hasAdPermissions={hasAdPermissions}
          permissions={permissions}
        />
        
        {!isAuthenticated && (
          <Troubleshooting
            tokenExists={tokenExists}
            onRetryConnection={onRetryConnection}
            onConnectWithBrowser={onConnectWithBrowser}
          />
        )}
        
        {isAuthenticated && adAccounts.length === 0 && <NextSteps />}
        
        <DebugInfo
          tokenSource={tokenSource}
          userId={userId}
          tokenExists={tokenExists}
          tokenLength={token?.length}
        />

        <DiagnosticTools
          showDiagnostics={showDiagnostics}
          setShowDiagnostics={setShowDiagnostics}
          diagnosticResults={diagnosticResults}
          isRunningTest={isRunningTest}
          isRunningComprehensiveDiagnostic={isRunningComprehensiveDiagnostic}
          handleRunDiagnostic={handleRunDiagnostic}
          handleApiTest={handleApiTest}
          handleCorsCheck={handleCorsCheck}
          handleComprehensiveDiagnostic={handleComprehensiveDiagnostic}
          handleBrowserCompatibility={handleBrowserCompatibility}
          handleTestProxy={handleTestProxy}
        />

        {showDiagnostics && diagnosticResults && (
          <DiagnosticResults
            diagnosticResults={diagnosticResults}
            proxyTestResult={proxyTestResult}
            handleFullPageRefresh={handleFullPageRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;
