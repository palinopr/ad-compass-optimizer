
// Global flag to track Meta permissions error state
export let metaPermissionsInvalid = false;

/**
 * Reset Meta permissions invalid flag
 */
export const resetMetaPermissionsInvalid = (): void => {
  metaPermissionsInvalid = false;
  localStorage.removeItem('meta_permissions_invalid');
};

/**
 * Set Meta permissions invalid flag
 */
export const setMetaPermissionsInvalid = (): void => {
  metaPermissionsInvalid = true;
  localStorage.setItem('meta_permissions_invalid', 'true');
};

/**
 * Check for GraphMethodException or permission errors
 */
export const isPermissionError = (errorDetails?: any, error?: string): boolean => {
  if (!errorDetails && !error) return false;
  
  return (
    errorDetails?.code === 100 || 
    errorDetails?.code === 190 || 
    errorDetails?.code === 200 ||
    (errorDetails?.subcode === 33) ||
    (typeof error === 'string' && 
      (error.includes('permission') || 
       error.includes('access') || 
       error.includes('authorize')))
  );
};

/**
 * Handle campaign fetch error and determine if it's permission related
 */
export const handleCampaignFetchError = (
  error: any, 
  errorDetails: any,
  setCampaignsFetchStatus: (status: 'success' | 'unauthorized' | 'error' | null) => void
): void => {
  // Check for GraphMethodException or permission errors
  if (isPermissionError(errorDetails, error)) {
    console.log('[CAMPAIGN FETCH] Permission error detected, marking as unauthorized');
    setCampaignsFetchStatus('unauthorized');
    localStorage.setItem('campaign_fetch_unauthorized', 'true');
    
    // Specific check for code 100, subcode 33 (permissions error)
    if (errorDetails?.code === 100 && errorDetails?.subcode === 33) {
      console.log('⚠️ Meta permission error – insights blocked due to missing access (code 100 / subcode 33)');
      setMetaPermissionsInvalid();
    }
  } else {
    setCampaignsFetchStatus('error');
    localStorage.setItem('campaign_fetch_unauthorized', 'false');
  }
  
  // Store error for debugging
  try {
    localStorage.setItem('last_campaign_fetch_error_details', JSON.stringify({
      error: error,
      timestamp: new Date().toISOString()
    }));
  } catch (e) {
    // Ignore storage errors
  }
};
