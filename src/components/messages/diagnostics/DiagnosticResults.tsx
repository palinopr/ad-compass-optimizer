
import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComprehensiveDiagnosticResult } from '@/utils/meta-diagnostics/types';

interface DiagnosticResultsProps {
  diagnosticResults: ComprehensiveDiagnosticResult | null;
  proxyTestResult?: any;
  handleFullPageRefresh?: () => void;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  diagnosticResults,
  proxyTestResult,
  handleFullPageRefresh
}) => {
  if (!diagnosticResults) return null;

  const hasCorsIssues = diagnosticResults?.cors?.hasCorsIssues || false;

  return (
    <div className="bg-gray-100 p-3 rounded-md">
      <h5 className="font-medium text-xs mb-1">Diagnostic Results:</h5>
      <pre className="text-xs overflow-auto max-h-40">
        {JSON.stringify(diagnosticResults, null, 2)}
      </pre>
      
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

      {hasCorsIssues && handleFullPageRefresh && (
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleFullPageRefresh}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Force Full Page Refresh
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
  );
};

export default DiagnosticResults;
