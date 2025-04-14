
import { useState } from 'react';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { ComprehensiveDiagnosticResult } from '@/utils/meta-diagnostics/types';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export const useDiagnostics = () => {
  const { toast } = useToast();
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<ComprehensiveDiagnosticResult | null>(null);

  const runDiagnostics = async () => {
    // Log the current state for debugging
    console.log('[META DEBUG] Starting diagnostic run...');
    const token = metaAuthService.getAccessToken();
    console.log('[META DEBUG] Current token:', token ? `${token.substring(0, 10)}... (${token.length} chars)` : 'No token');
    
    setIsRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log('[META DEBUG] Diagnostic results:', results);
      setDiagnosticResults(results);
      setShowResults(true);
      
      // Persist diagnostic results in sessionStorage for debugging
      sessionStorage.setItem('last_diagnostic_results', JSON.stringify(results));
    } catch (error) {
      console.error('[META DEBUG] ❌ Error running diagnostics:', error);
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
                        (diagnosticResults.tokenAnalysis && diagnosticResults.tokenAnalysis.isValid === false) ||
                        diagnosticResults.token.tokenLength < 50;
    
    // Check for permission issues - must have at least one of these permissions
    const permissionIssues = !(diagnosticResults.token.hasAdsRead === true || 
                             diagnosticResults.token.hasAdsManagement === true);
    
    // Check for API connection issues
    const apiIssues = diagnosticResults.api && !diagnosticResults.api.success;
    
    // Check for selected ad account only if all other checks passed
    const adAccountIssues = !tokenIssues && !permissionIssues && !apiIssues && 
                            !localStorage.getItem('selected_ad_account');
    
    // Data loading issues - add detection for cases when all checks pass but data still doesn't load
    const dataLoadingIssues = !tokenIssues && !permissionIssues && !apiIssues && !adAccountIssues &&
                              localStorage.getItem('last_campaign_fetch_success') === 'false';
                              
    // Empty campaigns issue - when everything works but there are no campaigns
    const emptyCampaignsIssue = !tokenIssues && !permissionIssues && !apiIssues && !adAccountIssues &&
                                !dataLoadingIssues && parseInt(localStorage.getItem('last_campaign_count') || '0') === 0;
    
    // Log issue details for debugging
    if (tokenIssues || permissionIssues || apiIssues || adAccountIssues || dataLoadingIssues || emptyCampaignsIssue) {
      console.log('[META DEBUG] Diagnostic issues detected:');
      if (tokenIssues) console.log('[META DEBUG] Token issues:', { 
        hasToken: diagnosticResults.token.hasToken, 
        isValid: diagnosticResults.tokenAnalysis?.isValid, 
        length: diagnosticResults.token.tokenLength 
      });
      if (permissionIssues) console.log('[META DEBUG] Permission issues:', { 
        hasAdsRead: diagnosticResults.token.hasAdsRead, 
        hasAdsManagement: diagnosticResults.token.hasAdsManagement 
      });
      if (apiIssues) console.log('[META DEBUG] API issues:', diagnosticResults.api.error || "API call failed");
      if (adAccountIssues) console.log('[META DEBUG] Ad account issues: No ad account selected');
      if (dataLoadingIssues) console.log('[META DEBUG] Data loading issues: Campaign data fetch failed');
      if (emptyCampaignsIssue) console.log('[META DEBUG] Empty campaigns issue: No campaigns found in this account');
    }
    
    return tokenIssues || permissionIssues || apiIssues || adAccountIssues || dataLoadingIssues || emptyCampaignsIssue;
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
