
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

      // Double-check the authentication state for consistency
      const authState = metaAuthService.isAuthenticated();
      console.log("AuthService authentication state:", authState);
      console.log("Token validity from diagnostic:", results.tokenAnalysis?.isValid);
      
      // Check if we're actually getting campaign data
      const adAccountId = localStorage.getItem('selected_ad_account');
      console.log("Selected ad account:", adAccountId);
      
      // Add a data loading check to diagnostics
      results.dataCheck = {
        adAccountSelected: !!adAccountId,
        lastCampaignFetchAttempt: localStorage.getItem('last_campaign_fetch_attempt'),
        lastCampaignFetchSuccess: localStorage.getItem('last_campaign_fetch_success'),
        lastCampaignCount: localStorage.getItem('last_campaign_count') || '0'
      };
      
      // Add campaign loading issue detection to summary
      if (adAccountId && 
          results.token.hasToken && 
          results.tokenAnalysis && 
          results.tokenAnalysis.isValid !== false &&
          results.api.success) {
          
        // If all checks pass but no campaigns are loading, add a specific issue
        const lastCampaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
        const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
        
        if (lastFetchSuccess && lastCampaignCount === 0) {
          if (results.summary && results.summary.issues) {
            // Replace "No issues detected" with empty campaigns warning
            if (results.summary.issues.includes('No issues detected')) {
              results.summary.issues = ['Your account is properly connected, but no campaigns were found in this ad account.'];
              
              if (results.summary.recommendations) {
                results.summary.recommendations.unshift(
                  'Try selecting a different ad account that contains campaigns',
                  'Or create a new campaign in this ad account'
                );
              }
            }
          }
        } else if (!lastFetchSuccess) {
          // Add data loading issue
          if (results.summary && results.summary.issues) {
            // Replace "No issues detected" with data loading issue
            if (results.summary.issues.includes('No issues detected')) {
              results.summary.issues = ['Campaign data failed to load despite valid authentication and permissions.'];
              
              if (results.summary.recommendations) {
                results.summary.recommendations = [
                  'Check browser console for specific API errors',
                  'Try reconnecting your Facebook account',
                  'Try selecting a different ad account',
                  'Verify your ad account has active campaigns'
                ];
              }
            }
          }
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
                        (diagnosticResults.tokenAnalysis && diagnosticResults.tokenAnalysis.isValid === false) ||
                        diagnosticResults.token.tokenLength < 50;
    
    // Check for permission issues - must have at least one of these permissions
    const permissionIssues = !diagnosticResults.token.hasAdsRead && 
                             !diagnosticResults.token.hasAdsManagement;
    
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
      console.log("Diagnostic issues detected:");
      if (tokenIssues) console.log("- Token issues:", { 
        hasToken: diagnosticResults.token.hasToken, 
        isValid: diagnosticResults.tokenAnalysis?.isValid, 
        length: diagnosticResults.token.tokenLength 
      });
      if (permissionIssues) console.log("- Permission issues:", { 
        hasAdsRead: diagnosticResults.token.hasAdsRead, 
        hasAdsManagement: diagnosticResults.token.hasAdsManagement 
      });
      if (apiIssues) console.log("- API issues:", diagnosticResults.api.error || "API call failed");
      if (adAccountIssues) console.log("- Ad account issues: No ad account selected");
      if (dataLoadingIssues) console.log("- Data loading issues: Campaign data fetch failed");
      if (emptyCampaignsIssue) console.log("- Empty campaigns issue: No campaigns found in this account");
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
