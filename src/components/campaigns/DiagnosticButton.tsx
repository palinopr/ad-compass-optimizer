
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, Loader2 } from 'lucide-react';
import { useDiagnostics } from '@/hooks/useDiagnostics';
import DiagnosticResultsDialog from './diagnostic-components/DiagnosticResultsDialog';

const DiagnosticButton = () => {
  const {
    isRunningDiagnostic,
    showResults,
    setShowResults,
    diagnosticResults,
    hasIssues,
    runDiagnostics
  } = useDiagnostics();

  return (
    <>
      <div className="flex justify-center mt-10 mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-amber-300 hover:bg-amber-50" 
          onClick={runDiagnostics}
          disabled={isRunningDiagnostic}
        >
          {isRunningDiagnostic ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bug className="h-4 w-4" />
          )}
          {isRunningDiagnostic ? "Running Diagnostics..." : "Troubleshoot Campaign Loading Issues"}
        </Button>
      </div>

      <DiagnosticResultsDialog
        showResults={showResults}
        setShowResults={setShowResults}
        diagnosticResults={diagnosticResults}
        hasIssues={hasIssues}
        isRunningDiagnostic={isRunningDiagnostic}
        runDiagnostics={runDiagnostics}
      />
    </>
  );
};

export default DiagnosticButton;
