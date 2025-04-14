
/**
 * Save API usage data for diagnostics
 */
export const saveApiUsageData = (headers: Headers): void => {
  try {
    const usageData: {
      appUsage?: string;
      businessUsage?: string;
      timestamp: string;
    } = {
      timestamp: new Date().toISOString()
    };
    
    // Extract usage data from headers
    const appUsage = headers.get('x-app-usage') || headers.get('x-app-usage-batch');
    const businessUsage = headers.get('x-business-use-case-usage');
    
    if (appUsage) {
      usageData.appUsage = appUsage;
    }
    
    if (businessUsage) {
      usageData.businessUsage = businessUsage;
    }
    
    if (appUsage || businessUsage) {
      localStorage.setItem('meta_api_last_usage', JSON.stringify(usageData));
      console.log('Saved API usage data:', usageData);
    }
  } catch (e) {
    console.error('Error saving API usage data:', e);
  }
};

/**
 * Check for rate limit based on API usage headers
 */
export const checkUsageHeaders = (headers: Headers): boolean => {
  try {
    // Check x-app-usage header
    const appUsageHeader = headers.get('x-app-usage') || headers.get('x-app-usage-batch');
    if (appUsageHeader) {
      try {
        const appUsage = JSON.parse(appUsageHeader);
        // If call_count or total_cputime is over 95%, we're nearing rate limit
        if ((appUsage.call_count && appUsage.call_count > 95) || 
            (appUsage.total_cputime && appUsage.total_cputime > 95) ||
            (appUsage.total_time && appUsage.total_time > 95)) {
          
          console.warn('Rate limit threshold approaching:', appUsage);
          return true;
        }
      } catch (e) {
        console.error('Error parsing x-app-usage header:', e);
      }
    }
    
    return false;
  } catch (e) {
    console.error('Error checking usage headers:', e);
    return false;
  }
};
