
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

  const getIssuesList = () => {
    if (!diagnosticResults) return [];
    
    const issues = [];
    
    if (!diagnosticResults.token.hasToken) {
      issues.push("Not authenticated with Meta. Please connect your account.");
    }
    
    if (!diagnosticResults.token.hasAdsRead && !diagnosticResults.token.hasAdsManagement) {
      issues.push("Missing required permissions for accessing campaign data.");
    }
    
    if (!diagnosticResults.api.success) {
      issues.push("Unable to connect to Meta API. Check your connection settings.");
    }
    
    if (!localStorage.getItem('selected_ad_account')) {
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
            {getStatusIcon(diagnosticResults.token.hasToken)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Permissions</span>
          <div className="flex items-center">
            {getStatusIcon(diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">API Connection</span>
          <div className="flex items-center">
            {getStatusIcon(diagnosticResults.api.success)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium">Ad Account</span>
          <div className="flex items-center">
            {getStatusIcon(!!localStorage.getItem('selected_ad_account'))}
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
        
        {diagnosticResults.summary && diagnosticResults.summary.recommendations && diagnosticResults.summary.recommendations.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Recommended Actions:</h3>
            <ul className="list-decimal pl-4 text-sm">
              {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticResults;
