
import { MetaApiService } from '@/services/MetaApiService';
import { AdAccount } from '../types';
import { getMockAdAccount } from './mockAccountData';

export const fetchAllAccounts = async (token: string): Promise<AdAccount[]> => {
  // Return mock data if in mock mode
  if (localStorage.getItem("USE_MOCK_MODE") === "true") {
    console.log('🎭 Mock mode: Returning mock ad account');
    return [getMockAdAccount()];
  }

  try {
    console.log('[META] Testing connection before fetching accounts...');
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    console.log('[META] Connection test successful, fetching ad accounts...');
    const accounts = await MetaApiService.fetchAdAccounts(token);
    
    // Detailed logging of the API response
    console.log('[AD ACCOUNTS RESPONSE]:', accounts);
    console.log('[META] Total accounts fetched:', accounts.length);
    
    accounts.forEach((acct, i) => {
      console.log(`[META] Account ${i}: ID=${acct.id}, Name=${acct.name}`);
    });

    if (accounts.length === 0) {
      console.warn('[META] ⚠️ No ad accounts returned from Meta API');
    }

    return accounts;
  } catch (error) {
    console.error('[META] Error in fetchAllAccounts:', error);
    throw error;
  }
};

export const fetchSelectedAccounts = async (selectedIds: string[], token: string): Promise<AdAccount[]> => {
  // Return mock data if in mock mode
  if (localStorage.getItem("USE_MOCK_MODE") === "true") {
    console.log('🎭 Mock mode: Returning mock ad account');
    return [getMockAdAccount()];
  }

  try {
    console.log('[META] Testing connection before fetching selected accounts...');
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    console.log('[META] Fetching selected accounts:', selectedIds);
    const accounts = await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const formattedId = id.startsWith('act_') ? id : `act_${id}`;
          console.log(`[META] Fetching details for account ${formattedId}`);
          const accountDetails = await MetaApiService.fetchAdAccountDetails(token, formattedId);
          console.log(`[META] Details for account ${formattedId}:`, accountDetails);
          return accountDetails;
        } catch (error) {
          console.error(`[META] Error fetching details for account ${id}:`, error);
          return null;
        }
      })
    );
    
    const filteredAccounts = accounts.filter(account => account !== null) as AdAccount[];

    console.log('[META] Selected accounts fetched:', filteredAccounts);
    console.log('[META] Total selected accounts retrieved:', filteredAccounts.length);

    if (filteredAccounts.length === 0) {
      console.warn('[META] ⚠️ No selected ad accounts could be retrieved');
    }

    return filteredAccounts;
  } catch (error) {
    console.error('[META] Error in fetchSelectedAccounts:', error);
    throw error;
  }
};
