
export const parseErrorMessage = (fetchErrorRaw: string | null): string | null => {
  if (!fetchErrorRaw) return null;
  
  try {
    const errorObj = JSON.parse(fetchErrorRaw);
    return errorObj.message || 'Unknown error';
  } catch (e) {
    return fetchErrorRaw || 'Error parsing error details';
  }
};

export const checkDataInconsistency = (
  lastFetchSuccess: boolean,
  campaignCount: number,
  tokenAnalysis?: any
): boolean => {
  // Check for successful API fetch but data not showing in UI
  const hasValidData = lastFetchSuccess && campaignCount > 0;
  
  // Check if we're on a page that should show campaigns
  const onCampaignsPage = window.location.pathname.includes('campaign');
  
  // Either we have CORS issues or we're on the campaigns page with data that should be showing
  return hasValidData && (
    (tokenAnalysis?.cors?.hasCorsIssues) || 
    (onCampaignsPage && localStorage.getItem('display_issue_detected') === 'true')
  );
};

export const checkUIDisplayIssue = (
  campaignCount: number,
  pathname: string,
  tokenAnalysis?: any
): boolean => {
  // More aggressive check for UI display issues
  const hasData = campaignCount > 0;
  
  // Check various indicators of display problems
  return hasData && (
    // Either user is on campaigns page but no data shows
    pathname.includes('campaign') || 
    // Or we have explicit CORS issues
    (tokenAnalysis?.cors?.hasCorsIssues) || 
    // Or there's a mismatch between data fetched and displayed
    localStorage.getItem('display_issue_detected') === 'true' ||
    // Or we have a record of previously attempting fixes
    localStorage.getItem('ui_fix_attempted') === 'true'
  );
};

export const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch (e) {
    return 'Invalid timestamp';
  }
};

// New utility functions for better diagnostics
export const detectBrowserIncompatibility = (): boolean => {
  // Check for known browser compatibility issues
  const ua = navigator.userAgent;
  const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
  const isOldEdge = ua.indexOf('Edge/') > -1;
  const isOldSafari = /Version\/[0-9]\..*Safari/.test(ua);
  
  return isIE || isOldEdge || isOldSafari;
};

export const detectNetworkIssues = async (): Promise<boolean> => {
  try {
    // Try to ping Facebook domain to check connectivity
    const response = await fetch('https://www.facebook.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return false; // No network issues detected
  } catch (e) {
    return true; // Network issues detected
  }
};
