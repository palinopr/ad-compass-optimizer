
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import DiagnosticResults from './DiagnosticResults';
import TokenDetails from './TokenDetails';

interface DiagnosticResultsDialogProps {
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  diagnosticResults: any;
  hasIssues: boolean;
  isRunningDiagnostic: boolean;
  runDiagnostics: () => void;
}

const DiagnosticResultsDialog: React.FC<DiagnosticResultsDialogProps> = ({
  showResults,
  setShowResults,
  diagnosticResults,
  hasIssues,
  isRunningDiagnostic,
  runDiagnostics
}) => {
  return (
    <AlertDialog open={showResults} onOpenChange={setShowResults}>
      <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            {hasIssues ? (
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            )}
            Campaign Loading Diagnostic Results
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasIssues
              ? "We've found some issues that might be affecting your campaign data loading"
              : "All systems look good, but here are some details about your connection"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isRunningDiagnostic ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <p>Running comprehensive diagnostics...</p>
          </div>
        ) : diagnosticResults ? (
          <div className="space-y-4">
            <DiagnosticResults 
              diagnosticResults={diagnosticResults} 
              hasIssues={hasIssues} 
            />
            
            {/* Show token details in a separate section */}
            {diagnosticResults.token && (
              <TokenDetails tokenInfo={diagnosticResults.token} tokenAnalysis={diagnosticResults.tokenAnalysis} />
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No diagnostic information available
          </div>
        )}

        <AlertDialogFooter className="flex flex-row justify-between items-center">
          <Button
            variant="outline"
            onClick={runDiagnostics}
            disabled={isRunningDiagnostic}
            className="flex items-center gap-2"
          >
            {isRunningDiagnostic ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunningDiagnostic ? "Running..." : "Run New Diagnostic"}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResults(false)}
            >
              Close
            </Button>
            
            <a 
              href="https://developers.facebook.com/docs/marketing-api/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Meta API Docs
              </Button>
            </a>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiagnosticResultsDialog;
