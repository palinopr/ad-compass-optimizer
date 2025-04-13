
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import DiagnosticResults from './DiagnosticResults';
import TokenDetails from './TokenDetails';

interface DiagnosticResultsDialogProps {
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  diagnosticResults: any;
  hasIssues: () => boolean;
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
          <>
            <DiagnosticResults 
              diagnosticResults={diagnosticResults} 
              hasIssues={hasIssues()} 
            />
            
            <TokenDetails 
              tokenInfo={{
                hasToken: diagnosticResults.token.hasToken,
                tokenLength: diagnosticResults.token.tokenLength,
                tokenAge: diagnosticResults.token.tokenAge
              }} 
            />
          </>
        )}
        
        <AlertDialogFooter>
          <Button onClick={() => setShowResults(false)}>Close</Button>
          <Button 
            variant="outline" 
            onClick={runDiagnostics} 
            className="ml-2"
            disabled={isRunningDiagnostic}
          >
            {isRunningDiagnostic ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Run Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiagnosticResultsDialog;
