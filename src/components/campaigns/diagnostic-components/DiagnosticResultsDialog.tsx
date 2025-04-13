
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import DiagnosticResults from './DiagnosticResults';
import TokenDetails from './TokenDetails';

interface ApiErrorDetailsProps {
  apiError: any;
}

const ApiErrorDetails: React.FC<ApiErrorDetailsProps> = ({ apiError }) => {
  if (!apiError || !apiError.error) return null;
  
  return (
    <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
      <h4 className="text-sm font-medium text-red-700 mb-1">API Error Details:</h4>
      <div className="text-xs text-red-600">
        <p><strong>Code:</strong> {apiError.error.code || 'N/A'}</p>
        <p><strong>Message:</strong> {apiError.error.message || 'Unknown error'}</p>
        {apiError.error.type && (
          <p><strong>Type:</strong> {apiError.error.type}</p>
        )}
        {apiError.error.code === 190 && (
          <div className="mt-1 pt-1 border-t border-red-200">
            <p className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              This is an invalid/expired token error. Please generate a new token.
            </p>
          </div>
        )}
        {apiError.error.code === 200 && (
          <div className="mt-1 pt-1 border-t border-red-200">
            <p className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              This is a permission error. Ensure your token has the required permissions.
            </p>
          </div>
        )}
      </div>
      <div className="mt-2">
        <a 
          href="https://developers.facebook.com/docs/marketing-api/error-reference" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Meta API Error Reference
        </a>
      </div>
    </div>
  );
};

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
            
            {diagnosticResults.api && !diagnosticResults.api.success && (
              <ApiErrorDetails apiError={diagnosticResults.api.data || diagnosticResults.api} />
            )}
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
