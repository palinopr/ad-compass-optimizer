import { MetaApiService } from '@/services/MetaApiService';
import { AdAccount } from '../types';
import { metaAuthService } from '@/services/MetaAuthService';
import { getMockAdAccount } from './mockAccountData';

export const fetchAllAccounts = async (token: string): Promise<AdAccount[]> => {
  // Return mock data if in mock mode
  if (localStorage.getItem("USE_MOCK_MODE") === "true") {
    console.log('🎭 Mock mode: Returning mock ad account');
    return [getMockAdAccount()];
  }

  try {
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    const accounts = await MetaApiService.fetchAdAccounts(token);
    console.log('[AD ACCOUNT FETCH] Fetched all accounts:', accounts.length);
    
    // Additional detailed logging
    console.log('[AD ACCOUNT FETCH] Total accounts fetched:', accounts.length);
    accounts.forEach((acct, i) => {
      console.log(`[AD ACCOUNT ${i}]`, acct.id, acct.name);
    });

    if (accounts.length === 0) {
      console.warn('[AD ACCOUNT FETCH] ⚠️ No ad accounts returned from Meta API');
    }

    return accounts;
  } catch (error) {
    console.error('[AD ACCOUNT FETCH] Error in fetchAllAccounts:', error);
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
    const connectionTest = await MetaApiService.testConnection(token);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error || 'Invalid or expired token');
    }
    
    const accounts = await Promise.all(
      selectedIds.map(async (id) => {
        try {
          const formattedId = id.startsWith('act_') ? id : `act_${id}`;
          console.log(`Fetching details for account ${formattedId}`);
          const accountDetails = await MetaApiService.fetchAdAccountDetails(token, formattedId);
          return accountDetails;
        } catch (error) {
          console.error(`Error fetching details for account ${id}:`, error);
          return null;
        }
      })
    );
    
    const filteredAccounts = accounts.filter(account => account !== null) as AdAccount[];

    // Additional detailed logging
    console.log('[AD ACCOUNT FETCH] Total accounts fetched:', filteredAccounts.length);
    filteredAccounts.forEach((acct, i) => {
      console.log(`[AD ACCOUNT ${i}]`, acct.id, acct.name);
    });

    if (filteredAccounts.length === 0) {
      console.warn('[AD ACCOUNT FETCH] ⚠️ No ad accounts returned from Meta API');
    }

    return filteredAccounts;
  } catch (error) {
    console.error('Error in fetchSelectedAccounts:', error);
    throw error;
  }
};
