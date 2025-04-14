
/**
 * API usage tracking utilities
 */

// Storage keys
const API_USAGE_KEY_PREFIX = 'meta_api_usage_';

/**
 * Get account-specific usage key
 */
const getAccountUsageKey = (accountId?: string) => {
  if (!accountId) return API_USAGE_KEY_PREFIX;
  return `${API_USAGE_KEY_PREFIX}${accountId}`;
};

/**
 * Store API usage data
 */
export const storeApiUsage = (usageData: any, accountId?: string) => {
  try {
    const key = getAccountUsageKey(accountId);
    
    // Store with timestamp
    const storedData = {
      usage: usageData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(storedData));
    console.log(`Stored API usage for account ${accountId || 'default'}`);
  } catch (e) {
    console.error('Error storing API usage:', e);
  }
};

/**
 * Get stored API usage data
 */
export const getApiUsage = (accountId?: string) => {
  try {
    const key = getAccountUsageKey(accountId);
    const storedData = localStorage.getItem(key);
    
    if (!storedData) {
      return null;
    }
    
    return JSON.parse(storedData);
  } catch (e) {
    console.error('Error getting API usage:', e);
    return null;
  }
};

/**
 * Check if we're approaching API usage limits
 */
export const isApproachingUsageLimit = (accountId?: string) => {
  const usageData = getApiUsage(accountId);
  
  if (!usageData || !usageData.usage) {
    return false;
  }
  
  const { usage } = usageData;
  
  // Check if any usage metrics are over 80%
  return (
    usage.call_count > 80 || 
    usage.total_cputime > 80 || 
    usage.total_time > 80
  );
};

/**
 * Get usage percentage (highest of all metrics)
 */
export const getUsagePercentage = (accountId?: string) => {
  const usageData = getApiUsage(accountId);
  
  if (!usageData || !usageData.usage) {
    return 0;
  }
  
  const { usage } = usageData;
  
  // Return the highest percentage from all metrics
  return Math.max(
    usage.call_count || 0,
    usage.total_cputime || 0,
    usage.total_time || 0
  );
};
