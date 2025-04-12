
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
