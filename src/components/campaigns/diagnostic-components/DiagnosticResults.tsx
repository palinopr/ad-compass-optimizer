
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface DiagnosticResultsProps {
  diagnosticResults: any;
  hasIssues: boolean;
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  diagnosticResults,
  hasIssues,
}) => {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  // Verify authentication status based on token validity
  const isAuthenticated = diagnosticResults?.token?.hasToken && 
                          diagnosticResults?.tokenAnalysis?.isValid !== false &&
                          diagnosticResults?.token?.tokenLength > 50;

  // Check permissions based on token data
  const hasRequiredPermissions = diagnosticResults?.token?.hasAdsRead || 
                                diagnosticResults?.token?.hasAdsManagement;
                              
  // Check API connection
  const apiConnectionSuccess = diagnosticResults?.api?.success === true;
  
  // Check ad account selection
  const hasAdAccount = !!localStorage.getItem('selected_ad_account');

  const getIssuesList = () => {
    if (!diagnosticResults) return [];
    
    const issues = [];
    
    if (!isAuthenticated) {
      issues.push("Not authenticated with Meta. Please connect your account.");
    }
    
    if (isAuthenticated && !hasRequiredPermissions) {
      issues.push("Missing required permissions for accessing campaign data.");
    }
    
    if (isAuthenticated && !apiConnectionSuccess) {
      const errorMsg = diagnosticResults?.api?.error?.message || 'Unknown error';
      const errorCode = diagnosticResults?.api?.error?.code || '';
      issues.push(`Unable to connect to Meta API: ${errorMsg} ${errorCode ? `(Code: ${errorCode})` : ''}`);
    }
    
    if (isAuthenticated && apiConnectionSuccess && !hasAdAccount) {
      issues.push("No ad account selected. Please select an ad account.");
    }
    
    return issues.length > 0 ? issues : ["No issues detected. If you're still experiencing problems, try refreshing your connection or your browser."];
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Authentication</span>
          <div className="flex items-center">
            {getStatusIcon(isAuthenticated)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Permissions</span>
          <div className="flex items-center">
            {getStatusIcon(hasRequiredPermissions)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">API Connection</span>
          <div className="flex items-center">
            {getStatusIcon(apiConnectionSuccess)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Ad Account</span>
          <div className="flex items-center">
            {getStatusIcon(hasAdAccount)}
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Issues & Solutions:</h3>
        <ul className="space-y-2">
          {getIssuesList().map((issue, index) => (
            <li key={index} className="text-sm flex gap-2">
              <div className="mt-1 flex-shrink-0">
                {issue.includes("No issues") ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
        
        {/* Only show recommendations if there are actual issues */}
        {diagnosticResults && getIssuesList()[0] !== "No issues detected. If you're still experiencing problems, try refreshing your connection or your browser." && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Recommended Actions:</h3>
            {diagnosticResults.summary && diagnosticResults.summary.recommendations && diagnosticResults.summary.recommendations.length > 0 ? (
              <ul className="list-decimal pl-4 text-sm">
                {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No specific recommendations available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticResults;
