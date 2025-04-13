
// Browser compatibility checking utilities

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
  
  const browserInfo = {
    browser: {
      userAgent,
      isIE,
      isOldEdge,
      hasFetch,
      hasLocalStorage,
      hasCookies,
      hasPrivacyFeatures
    }
  };
  
  // Calculate compatibility score and issues
  let score = 100;
  const issues: string[] = [];
  
  if (isIE) {
    issues.push('Internet Explorer is not supported by Meta API');
    score = 0;
  } else if (isOldEdge) {
    issues.push('Old Microsoft Edge may have CORS issues with Meta API');
    score = 50;
  } else if (!hasFetch) {
    issues.push('Browser does not support fetch API');
    score = 30;
  } else if (!hasLocalStorage) {
    issues.push('Browser does not support localStorage');
    score = 40;
  } else if (!hasCookies) {
    issues.push('Cookies are disabled, which may affect authentication');
    score = 60;
  } else if (hasPrivacyFeatures) {
    issues.push('Browser has privacy features that may block third-party requests');
    score = 70;
  } else {
    issues.push('No compatibility issues detected');
  }
  
  // Return format that matches the required interface
  const compatibility = {
    isCompatible: score >= 80,
    issues,
    score // We'll keep this for internal use
  };
  
  const results = {
    ...browserInfo,
    compatibility
  };
  
  console.log('Browser compatibility test results:', results);
  console.log('=== END COMPATIBILITY TEST ===');
  
  return results;
};
