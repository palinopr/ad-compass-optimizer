
// Summary generation utilities

import { TokenAnalysisResult } from './types';

// Generate a summary of all diagnostic checks
export const generateDiagnosticSummary = (
  token: any, 
  tokenAnalysis: TokenAnalysisResult, 
  api: any, 
  cors: any, 
  compatibility: any, 
  proxy: any
) => {
  let status: 'high' | 'medium' | 'low' | 'none' = 'none';
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Add token issues to summary based on token validity
  if (!token.hasToken) {
    issues.push('Not authenticated with Meta. Please connect your account.');
    recommendations.push('Connect your Meta account or manually enter a valid token');
    status = 'high';
  } else if (tokenAnalysis.issues && tokenAnalysis.issues.length > 0 && !tokenAnalysis.issues.includes('No token issues detected')) {
    issues.push(...tokenAnalysis.issues);
    recommendations.push(...tokenAnalysis.recommendations);
    status = tokenAnalysis.severity || 'medium';
  }
  
  // Add permission issues if token is valid but permissions are missing
  if (token.hasToken && tokenAnalysis.isValid && !token.hasAdsRead && !token.hasAdsManagement) {
    issues.push('Missing required permissions for accessing campaign data.');
    recommendations.push('Generate a token with ads_management and ads_read permissions');
    if (status !== 'high') status = 'medium';
  }
  
  // Add API issues if token is valid but API connection fails
  if (token.hasToken && tokenAnalysis.isValid && !api.success) {
    issues.push(`API connection failed: ${api.error?.message || JSON.stringify(api.error)}`);
    
    if (api.error?.code === 190) {
      recommendations.push('Your token is invalid or expired. Generate a new token.');
      status = 'high';
    } else if (api.error?.code === 200) {
      recommendations.push('Missing required permissions. Generate a token with ads_management and ads_read permissions.');
      status = 'high';
    } else {
      recommendations.push('Check network connection and API availability.');
      status = 'medium';
    }
  }
  
  const tokenSource = localStorage.getItem('meta_token_source') || 'unknown';
  const isFacebookAuth = tokenSource === 'facebook';
  
  // Only add CORS issues if not using Facebook auth
  if (cors.hasCorsIssues) {
    if (!isFacebookAuth) {
      issues.push('CORS policy preventing API access');
      
      // Make Facebook login the primary recommendation for CORS issues
      recommendations.push('Use Facebook Login to bypass CORS restrictions');
      
      if (proxy && proxy.proxyWorked) {
        recommendations.push('Use a proxy server to bypass CORS restrictions');
        status = 'medium'; // Downgraded since we have a workaround
      } else if (proxy.error && proxy.error.includes('access denied')) {
        recommendations.push('Request temporary access to the CORS proxy service');
        recommendations.push('Or use a different CORS proxy service');
        status = 'high';
      } else if (compatibility.compatibility && compatibility.compatibility.score < 80) {
        recommendations.push('Try using a different modern browser like Chrome or Firefox');
        status = 'high';
      } else {
        recommendations.push('Try using a browser extension to disable CORS protections for development');
        recommendations.push('Or implement a server-side proxy in your production app');
        status = 'high';
      }
    } else {
      // For Facebook auth, focus on other potential issues
      issues.push('API access issue with Facebook authentication');
      recommendations.push('Check Facebook permissions are complete (ads_read, ads_management)');
      recommendations.push('Verify ad account selection is correct');
      recommendations.push('Check for any API rate limits or temporary Facebook API issues');
      status = 'medium';
    }
  }
  
  // Add browser compatibility issues
  if (compatibility.isCompatible === false) {
    issues.push(...compatibility.issues);
    recommendations.push('Use a modern browser like Chrome, Firefox, or Edge');
    if (status !== 'high') status = 'medium';
  }
  
  // Add ad account selection issue only if other issues are resolved
  const hasAuthIssues = issues.some(issue => 
    issue.includes('Not authenticated') || 
    issue.includes('token')
  );
  
  const hasPermissionIssues = issues.some(issue => 
    issue.includes('permissions')
  );
  
  const hasApiIssues = issues.some(issue => 
    issue.includes('API connection')
  );
  
  // Only show ad account issue if no authentication/permission/API issues
  if (!hasAuthIssues && !hasPermissionIssues && !hasApiIssues && !localStorage.getItem('selected_ad_account')) {
    issues.push('No ad account selected. Please select an ad account.');
    recommendations.push('Select an ad account to view campaign data');
    if (status === 'none') status = 'medium';
  }
  
  // If everything is good but campaigns aren't loading
  if (token.hasToken && token.hasAdsRead && api.success && localStorage.getItem('selected_ad_account') && issues.length === 0) {
    issues.push('No issues detected');
    recommendations.push('Your Meta connection appears to be working correctly');
  }
  
  return {
    overallStatus: status,
    issues: issues.length > 0 ? issues : ['No issues detected'],
    recommendations: recommendations.length > 0 ? recommendations : ['Your Meta connection appears to be working correctly'],
  };
};
