
import { useState } from 'react';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export const useDiagnostics = () => {
  const { toast } = useToast();
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const runDiagnostics = async () => {
    // Log the current state for debugging
    console.log('Starting diagnostic run...');
    console.log('Current token:', metaAuthService.getAccessToken()?.substring(0, 10) + '...' || 'No token');
    
    setIsRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      setDiagnosticResults(results);
      setShowResults(true);
      
      // Persist diagnostic results in sessionStorage for debugging
      sessionStorage.setItem('last_diagnostic_results', JSON.stringify(results));
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast({
        title: "Diagnostic Error",
        description: "Failed to run connection diagnostics, check console for details",
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

  return {
    isRunningDiagnostic,
    showResults,
    setShowResults,
    diagnosticResults,
    hasIssues,
    runDiagnostics
  };
};
