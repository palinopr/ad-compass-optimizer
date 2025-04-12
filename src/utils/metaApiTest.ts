
export const testMetaApi = async () => {
  try {
    console.log('=== META API TEST ===');
    
    // Get token
    const token = localStorage.getItem('meta_access_token');
    console.log('Token available:', !!token);
    
    if (!token) {
      console.log('No token found, cannot proceed with API test');
      return { success: false, error: 'No token available' };
    }
    
    // Make a simple API call to /me endpoint
    console.log('Making API call to /me endpoint...');
    
    const apiVersion = 'v22.0'; // Make sure this matches your app's API version
    const url = `https://graph.facebook.com/${apiVersion}/me?access_token=${token}`;
    
    console.log('API URL:', url.replace(token, '[TOKEN HIDDEN]'));
    
    // Make the request
    const response = await fetch(url);
    
    console.log('Response status:', response.status, response.statusText);
    
    // Get response as text
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
      
      if (data.error) {
        console.log('API returned error:', data.error);
        return { success: false, error: data.error };
      }
      
      console.log('API call successful');
      return { success: true, data, error: '' }; // Adding empty error property to maintain consistent type
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', parseError);
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.log('API test error:', error);
    return { success: false, error: String(error) };
  } finally {
    console.log('=== END API TEST ===');
  }
};

export const checkForCorsIssues = async () => {
  try {
    const token = localStorage.getItem('meta_access_token');
    if (!token) return { hasCorsIssues: false, error: 'No token available' };
    
    // Make a preflight request
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${token}`,
      { method: 'OPTIONS' }
    );
    
    console.log('CORS preflight response:', response.status, response.statusText);
    
    // Check response headers
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    console.log('CORS headers:', corsHeaders);
    
    return { 
      hasCorsIssues: !corsHeaders['access-control-allow-origin'], 
      corsHeaders,
      error: '' // Adding empty error property to maintain consistent type
    };
  } catch (error) {
    console.error('CORS check error:', error);
    return { hasCorsIssues: true, error: String(error) };
  }
};

// Run all diagnostic tests and return a comprehensive report
export const runComprehensiveDiagnostic = async () => {
  console.log('=== LOVABLE COMPREHENSIVE DIAGNOSTIC ===');
  
  // Get browser info
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language
  };
  
  console.log('Browser info:', browserInfo);
  
  // Step 1: Run token diagnostic
  const { runTokenDiagnostic, analyzeDiagnosticResults } = await import('./metaTokenDiagnostic');
  const tokenResults = runTokenDiagnostic();
  console.log('Token diagnostic results:', tokenResults);
  const tokenAnalysis = analyzeDiagnosticResults(tokenResults);
  
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
  
  console.log('=== END COMPREHENSIVE DIAGNOSTIC ===');
  
  return {
    timestamp: new Date().toISOString(),
    browser: browserInfo,
    token: tokenResults,
    tokenAnalysis,
    api: apiResults,
    cors: corsResults,
    summary: generateDiagnosticSummary(tokenResults, tokenAnalysis, apiResults, corsResults)
  };
};

// Generate a summary of all diagnostic checks
const generateDiagnosticSummary = (token, tokenAnalysis, api, cors) => {
  let status = 'ok';
  const issues = [];
  const recommendations = [];
  
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
    recommendations.push('Try using a different connection method or browser');
    status = 'high';
  }
  
  return {
    overallStatus: status,
    issues: issues.length > 0 ? issues : ['No issues detected'],
    recommendations: recommendations.length > 0 ? recommendations : ['Your Meta connection appears to be working correctly'],
  };
};
