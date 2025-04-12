
// Comprehensive diagnostic runner

import { testMetaApi } from './apiTest';
import { checkForCorsIssues, testProxyApproach } from './corsCheck';
import { testBrowserCompatibility } from './browserCheck';
import { generateDiagnosticSummary } from './summaryGenerator';
import { ComprehensiveDiagnosticResult, TokenAnalysisResult } from './types';

// Run all diagnostic tests and return a comprehensive report
export const runComprehensiveDiagnostic = async (): Promise<ComprehensiveDiagnosticResult> => {
  console.log('=== LOVABLE COMPREHENSIVE DIAGNOSTIC ===');
  
  // Get browser info
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
  
  console.log('Browser info:', browserInfo);
  
  // Step 1: Run token diagnostic
  const { runTokenDiagnostic, analyzeDiagnosticResults } = await import('../metaTokenDiagnostic');
  const tokenResults = runTokenDiagnostic();
  console.log('Token diagnostic results:', tokenResults);
  const tokenAnalysis = analyzeDiagnosticResults(tokenResults) as TokenAnalysisResult;
  
  // Step 2: Check API connection
  let apiResults = { success: false, error: 'Test not run' };
  if (tokenResults.hasToken) {
    console.log('Testing API connection...');
    apiResults = await testMetaApi();
  }
  
  // Step 3: Check for CORS issues
  let corsResults = { hasCorsIssues: false, error: 'Test not run' };
  if (tokenResults.hasToken) {
    console.log('Checking for CORS issues...');
    corsResults = await checkForCorsIssues();
  }
  
  // Step 4: Test browser compatibility
  const compatibilityResults = testBrowserCompatibility();
  
  // Step 5: Test proxy approach if CORS issues are detected
  let proxyResults = { 
    proxyTested: false, 
    proxyWorked: false, 
    error: 'Not tested' 
  };
  
  if (corsResults.hasCorsIssues) {
    console.log('CORS issues detected, testing proxy approach...');
    const tempResults = await testProxyApproach();
    // Ensure the result matches the expected format
    proxyResults = {
      proxyTested: tempResults.proxyTested || false,
      proxyWorked: tempResults.proxyWorked || false,
      error: tempResults.error || ''
    };
  }
  
  console.log('=== END COMPREHENSIVE DIAGNOSTIC ===');
  
  return {
    timestamp: new Date().toISOString(),
    browser: browserInfo,
    token: tokenResults,
    tokenAnalysis,
    api: apiResults,
    cors: corsResults,
    compatibility: compatibilityResults,
    proxy: proxyResults,
    summary: generateDiagnosticSummary(tokenResults, tokenAnalysis, apiResults, corsResults, compatibilityResults, proxyResults)
  };
};
