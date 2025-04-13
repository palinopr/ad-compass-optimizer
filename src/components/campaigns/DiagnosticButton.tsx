
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, Bug, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

const DiagnosticButton = () => {
  const { toast } = useToast();
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      setDiagnosticResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast({
        title: "Diagnostic Error",
        description: "Failed to run connection diagnostics",
        variant: "destructive"
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const hasIssues = () => {
    if (!diagnosticResults) return false;
    return !diagnosticResults.token.hasToken || !diagnosticResults.api.success;
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

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <>
      <div className="flex justify-center mt-10 mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={runDiagnostics}
          disabled={isRunningDiagnostic}
        >
          {isRunningDiagnostic ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bug className="h-4 w-4" />
          )}
          {isRunningDiagnostic ? "Running Diagnostics..." : "Troubleshoot Campaign Issues"}
        </Button>
      </div>

      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {hasIssues() ? (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Campaign Diagnostic Results
            </AlertDialogTitle>
            <AlertDialogDescription>
              Here's what we found when analyzing your campaign connection:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {diagnosticResults && (
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
          )}
          
          <AlertDialogFooter>
            <Button onClick={() => setShowResults(false)}>Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DiagnosticButton;
