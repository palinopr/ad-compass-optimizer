
import { MetaApiService } from '@/services/MetaApiService';
import { AdAccount } from '../types';
import { getMockAdAccount } from './mockAccountData';
import { RateLimitManager } from '@/services/api/rate-limit/RateLimitManager';

export const fetchAllAccounts = async (token: string): Promise<AdAccount[]> => {
  // Return mock data if in mock mode
  if (localStorage.getItem("USE_MOCK_MODE") === "true") {
    console.log('🎭 Mock mode: Returning mock ad account');
    return [getMockAdAccount()];
  }

  try {
    // Check if rate limited
    if (RateLimitManager.isRateLimited() && !RateLimitManager.isRateLimitOverridden()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      console.warn(`Meta API rate limited. Remaining time: ${remainingTime} seconds`);
      throw new Error(`API rate limit in effect. Please retry after ${remainingTime} seconds.`);
    }

    console.log('[META] Testing connection before fetching accounts...');
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    console.log('[META] Connection test successful, fetching ad accounts...');
    const response = await MetaApiService.fetchAdAccounts(token);
    
    // Detailed logging of the API response
    console.log('[AD ACCOUNTS RESPONSE]:', {
      raw: response,
      count: response.length,
      data: response.map(acc => ({ id: acc.id, name: acc.name }))
    });

    if (!response || response.length === 0) {
      console.warn('[META] ⚠️ No ad accounts returned from Meta API');
      throw new Error('No ad accounts found. Please check Meta permissions and token scopes.');
    }

    // Never include hardcoded test accounts
    const realAccounts = response;
    
    realAccounts.forEach((acct, i) => {
      console.log(`[META] Account ${i + 1}: ID=${acct.id}, Name=${acct.name}`);
    });

    return realAccounts;
  } catch (error) {
    console.error('[META] Error in fetchAllAccounts:', error);
    throw error;
  }
};
