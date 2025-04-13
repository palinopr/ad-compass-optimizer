
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
    const token = metaAuthService.getAccessToken();
    console.log('Current token:', token ? `${token.substring(0, 10)}... (${token.length} chars)` : 'No token');
    
    setIsRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      
      // Compare local diagnostic results with MetaAuthService state
      if (results.token.hasToken !== !!metaAuthService.getAccessToken()) {
        console.warn("Inconsistency detected: Token diagnostic result doesn't match MetaAuthService state");
        
        // Try to reconcile the inconsistency
        if (metaAuthService.getAccessToken() && !results.token.hasToken) {
          console.log("Token found in MetaAuthService but not in diagnostic - updating diagnostic");
          results.token.hasToken = true;
          results.token.tokenLength = metaAuthService.getAccessToken()?.length || 0;
        }
      }
      
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

  // Enhanced detection logic for issues
  const hasIssues = () => {
    if (!diagnosticResults) return false;
    
    // Check for token issues
    const tokenIssues = !diagnosticResults.token.hasToken || 
                        diagnosticResults.tokenAnalysis?.isValid === false ||
                        diagnosticResults.token.tokenLength < 50;
    
    // Check for permission issues
    const permissionIssues = !diagnosticResults.token.hasAdsRead && !diagnosticResults.token.hasAdsManagement;
    
    // Check for API connection issues
    const apiIssues = !diagnosticResults.api.success;
    
    // Check for selected ad account
    const adAccountIssues = !localStorage.getItem('selected_ad_account');
    
    // Log issue details for debugging
    if (tokenIssues || permissionIssues || apiIssues || adAccountIssues) {
      console.log("Diagnostic issues detected:");
      if (tokenIssues) console.log("- Token issues:", { hasToken: diagnosticResults.token.hasToken, isValid: diagnosticResults.tokenAnalysis?.isValid, length: diagnosticResults.token.tokenLength });
      if (permissionIssues) console.log("- Permission issues:", { hasAdsRead: diagnosticResults.token.hasAdsRead, hasAdsManagement: diagnosticResults.token.hasAdsManagement });
      if (apiIssues) console.log("- API issues:", diagnosticResults.api.error || "API call failed");
      if (adAccountIssues) console.log("- Ad account issues: No ad account selected");
    }
    
    return tokenIssues || permissionIssues || apiIssues || adAccountIssues;
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
