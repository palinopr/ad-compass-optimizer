
import { MetaApiService } from '@/services/MetaApiService';
import { AdAccount } from '../types';
import { RateLimitManager } from '@/services/api/rate-limit/RateLimitManager';

export const fetchAllAccounts = async (token: string): Promise<AdAccount[]> => {
  try {
    // Check if rate limited
    if (RateLimitManager.isRateLimited() && !RateLimitManager.isRateLimitOverridden()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      console.warn(`Meta API rate limited. Remaining time: ${remainingTime} seconds`);
      throw new Error(`API rate limit in effect. Please retry after ${remainingTime} seconds.`);
    }

    console.log('[AD ACCOUNTS DEBUG] Testing connection before fetching accounts...');
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      console.error('[AD ACCOUNTS DEBUG] Connection test failed:', connectionTest.error);
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    console.log('[AD ACCOUNTS DEBUG] Connection test successful, fetching ad accounts...');
    const response = await MetaApiService.fetchAdAccounts(token);
    
    console.log('[AD ACCOUNTS DEBUG] Ad accounts response:', response);
    console.log('[AD ACCOUNTS DEBUG] Account count:', response?.length || 0);
    
    if (!response || !Array.isArray(response) || response.length === 0) {
      console.warn('[AD ACCOUNTS DEBUG] ⚠️ No ad accounts returned from Meta API');
      throw new Error('No ad accounts found. Please check Meta permissions and token scopes.');
    }

    // Validate and normalize account IDs
    const accounts = response.map(acct => ({
      ...acct,
      // Ensure consistent ID format with act_ prefix
      id: acct.id.startsWith('act_') ? acct.id : `act_${acct.id}`,
      // Add display name for dropdown
      displayName: `${acct.name} (${acct.id.replace('act_', '')})`
    }));

    // Clear invalid stored account if it exists
    const storedAccountId = localStorage.getItem('selected_ad_account');
    if (storedAccountId && !accounts.some(acc => 
      acc.id.replace(/^act_/, '') === storedAccountId.replace(/^act_/, '')
    )) {
      console.warn('[AD ACCOUNTS DEBUG] Stored account ID not found in fetched accounts, clearing...');
      localStorage.removeItem('selected_ad_account');
    }

    accounts.forEach((acct, i) => {
      console.log(`[AD ACCOUNTS DEBUG] Account ${i + 1}: ID=${acct.id}, Name=${acct.name}`);
    });

    return accounts;
  } catch (error) {
    console.error('[AD ACCOUNTS DEBUG] Error in fetchAllAccounts:', error);
    throw error;
  }
};
