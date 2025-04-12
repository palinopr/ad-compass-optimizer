
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
  let status = 'ok';
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Add token issues to summary
  if (tokenAnalysis.issues.length > 0 && tokenAnalysis.issues[0] !== 'No token issues detected') {
    issues.push(...tokenAnalysis.issues);
    recommendations.push(...tokenAnalysis.recommendations);
    status = tokenAnalysis.severity;
  }
  
  // Add API issues if any
  if (token.hasToken && !api.success) {
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
  
  // Add CORS issues if any
  if (cors.hasCorsIssues) {
    issues.push('CORS policy preventing API access');
    
    if (proxy && proxy.proxyWorked) {
      recommendations.push('Use a proxy server to bypass CORS restrictions');
      status = 'medium'; // Downgraded since we have a workaround
    } else if (compatibility.compatibility.score < 80) {
      recommendations.push('Try using a different modern browser like Chrome or Firefox');
      status = 'high';
    } else {
      recommendations.push('Try using a browser extension to disable CORS protections for development');
      recommendations.push('Or implement a server-side proxy in your production app');
      status = 'high';
    }
  }
  
  // Add browser compatibility issues
  if (compatibility.compatibility.score < 100 && compatibility.compatibility.issues[0] !== 'No compatibility issues detected') {
    issues.push(...compatibility.compatibility.issues);
    recommendations.push('Use a modern browser like Chrome, Firefox, or Edge');
    if (status !== 'high') status = 'medium';
  }
  
  return {
    overallStatus: status,
    issues: issues.length > 0 ? issues : ['No issues detected'],
    recommendations: recommendations.length > 0 ? recommendations : ['Your Meta connection appears to be working correctly'],
  };
};
