
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

// New function to test if a proxy approach might work
export const testProxyApproach = async () => {
  try {
    console.log('=== TESTING PROXY APPROACH ===');
    
    // Get token
    const token = localStorage.getItem('meta_access_token');
    if (!token) {
      return { 
        success: false, 
        proxyTested: false, 
        proxyWorked: false,
        error: 'No token available for proxy test' 
      };
    }
    
    // Use cors-anywhere demo proxy (note: this is rate-limited and for testing only)
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://graph.facebook.com/v22.0/me`;
    const proxyUrl = `${corsProxy}${apiUrl}?access_token=${token}`;
    
    console.log('Testing CORS proxy with:', corsProxy);
    
    // First try to get temporary access to the proxy (required for cors-anywhere)
    try {
      console.log('Attempting to get proxy access');
      const proxyCheckResponse = await fetch(corsProxy);
      const proxyText = await proxyCheckResponse.text();
      console.log('Proxy access check response:', proxyText);
    } catch (e) {
      console.log('Proxy access check failed:', e);
    }
    
    // Now try the actual proxy request
    console.log('Making proxied request to:', apiUrl);
    const proxyResponse = await fetch(proxyUrl, {
      headers: {
        'Origin': window.location.origin
      }
    });
    
    console.log('Proxy response status:', proxyResponse.status, proxyResponse.statusText);
    
    const responseText = await proxyResponse.text();
    try {
      const data = JSON.parse(responseText);
      if (data.error) {
        return { 
          success: false, 
          proxyTested: true, 
          proxyWorked: false,
          error: data.error.message || 'API error via proxy' 
        };
      } else {
        console.log('Proxy approach succeeded!');
        return { 
          success: true, 
          proxyTested: true, 
          proxyWorked: true,
          data,
          error: ''
        };
      }
    } catch (e) {
      return { 
        success: false, 
        proxyTested: true, 
        proxyWorked: false,
        error: 'Failed to parse proxy response' 
      };
    }
  } catch (error) {
    console.error('Proxy approach test error:', error);
    return { 
      success: false, 
      proxyTested: true, 
      proxyWorked: false,
      error: String(error) 
    };
  } finally {
    console.log('=== END PROXY TEST ===');
  }
};

// Test browser compatibility with Meta API requests
export const testBrowserCompatibility = () => {
  console.log('=== BROWSER COMPATIBILITY TEST ===');
  
  // Detect browser
  const userAgent = navigator.userAgent;
  console.log('User Agent:', userAgent);
  
  // Check for known problematic browsers or features
  const isIE = /MSIE|Trident/.test(userAgent);
  const isOldEdge = /Edge\/\d./i.test(userAgent) && !/Edg\/\d./i.test(userAgent);
  
  // Check if fetch is properly implemented
  const hasFetch = typeof fetch === 'function';
  
  // Check if localStorage is available
  const hasLocalStorage = (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  })();
  
  // Check if cookies are enabled
  const hasCookies = navigator.cookieEnabled;
  
  // Check for privacy features that might impact API calls
  let hasPrivacyFeatures = false;
  if (
    // Check for Firefox tracking protection
    /Firefox/.test(userAgent) && 
    // Or Brave browser
    /brave/i.test(navigator.userAgent)
  ) {
    hasPrivacyFeatures = true;
  }
  
  const results = {
    browser: {
      userAgent,
      isIE,
      isOldEdge,
      hasFetch,
      hasLocalStorage,
      hasCookies,
      hasPrivacyFeatures
    },
    compatibility: {
      score: 0,
      issues: []
    }
  };
  
  // Calculate compatibility score and issues
  if (isIE) {
    results.compatibility.issues.push('Internet Explorer is not supported by Meta API');
    results.compatibility.score = 0;
  } else if (isOldEdge) {
    results.compatibility.issues.push('Old Microsoft Edge may have CORS issues with Meta API');
    results.compatibility.score = 50;
  } else if (!hasFetch) {
    results.compatibility.issues.push('Browser does not support fetch API');
    results.compatibility.score = 30;
  } else if (!hasLocalStorage) {
    results.compatibility.issues.push('Browser does not support localStorage');
    results.compatibility.score = 40;
  } else if (!hasCookies) {
    results.compatibility.issues.push('Cookies are disabled, which may affect authentication');
    results.compatibility.score = 60;
  } else if (hasPrivacyFeatures) {
    results.compatibility.issues.push('Browser has privacy features that may block third-party requests');
    results.compatibility.score = 70;
  } else {
    results.compatibility.score = 100;
    results.compatibility.issues.push('No compatibility issues detected');
  }
  
  console.log('Browser compatibility test results:', results);
  console.log('=== END COMPATIBILITY TEST ===');
  
  return results;
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

// Generate a summary of all diagnostic checks
const generateDiagnosticSummary = (token, tokenAnalysis, api, cors, compatibility, proxy) => {
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
