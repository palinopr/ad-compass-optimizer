
import { useState } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { AdAccount } from '../types';

export function useAdAccountsFetching() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchAdAccounts = async () => {
    const accessToken = metaAuthService.getAccessToken();
    
    if (!accessToken) {
      console.log('No access token available for fetching ad accounts');
      setError('Not authenticated with Meta');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching ad accounts...');
      // Check if there are selected ad accounts in local storage
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      let selectedIds: string[] = [];
      
      if (selectedAdAccounts) {
        try {
          selectedIds = JSON.parse(selectedAdAccounts);
          console.log('Found selected ad accounts in storage:', selectedIds);
        } catch (e) {
          console.error('Error parsing selected ad accounts:', e);
          // Reset the corrupted storage
          localStorage.removeItem('selected_ad_accounts');
        }
      }
      
      let fetchedAccounts: AdAccount[] = [];
      
      if (selectedIds.length > 0) {
        // Fetch details for these specific accounts
        fetchedAccounts = await fetchSelectedAccounts(selectedIds);
        
        if (fetchedAccounts.length === 0) {
          // Try fetching all available accounts as fallback
          console.log('No valid accounts found from stored IDs, fetching all available accounts');
          fetchedAccounts = await fetchAllAccounts();
        }
      } else {
        // Fallback to fetching all available accounts
        console.log('No stored accounts, fetching all available accounts');
        fetchedAccounts = await fetchAllAccounts();
      }
      
      console.log('Successfully fetched accounts:', fetchedAccounts.length);
      setAdAccounts(fetchedAccounts);
      
    } catch (err) {
      handleFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSelectedAccounts = async (selectedIds: string[]): Promise<AdAccount[]> => {
    const token = metaAuthService.getAccessToken();
    if (!token) {
      console.log('No token available for fetching selected accounts');
      return [];
    }
    
    try {
      // First validate the token with a basic check
      const connectionTest = await MetaApiService.testConnection(token);
      if (!connectionTest.success) {
        console.error('Token validation failed:', connectionTest.error);
        throw new Error(connectionTest.error || 'Invalid or expired token');
      }
      
      const accounts = await Promise.all(
        selectedIds.map(async (id) => {
          try {
            // Format the ID correctly for the API call
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
      
      const validAccounts = accounts.filter(account => account !== null) as AdAccount[];
      console.log('Valid accounts retrieved:', validAccounts.length);
      return validAccounts;
    } catch (error) {
      console.error('Error in fetchSelectedAccounts:', error);
      throw error;
    }
  };
  
  const fetchAllAccounts = async (): Promise<AdAccount[]> => {
    const token = metaAuthService.getAccessToken();
    if (!token) {
      console.log('No token available for fetching all accounts');
      return [];
    }
    
    try {
      // Validate token first
      const connectionTest = await MetaApiService.testConnection(token);
      if (!connectionTest.success) {
        console.error('Token validation failed:', connectionTest.error);
        throw new Error(connectionTest.error || 'Invalid or expired token');
      }
      
      const accounts = await MetaApiService.fetchAdAccounts(token);
      console.log('Fetched all accounts:', accounts.length);
      return accounts;
    } catch (error) {
      console.error('Error in fetchAllAccounts:', error);
      throw error;
    }
  };
  
  const handleFetchError = (err: any) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Ad account fetch error:', errorMessage);
    
    if (errorMessage.includes('token') || 
        errorMessage.includes('400') || 
        errorMessage.includes('401')) {
      setError('Your Meta access token appears to be invalid or expired. Please reconnect your account.');
      // Flag for reconnection
      localStorage.setItem('show_meta_connection', 'true');
      localStorage.setItem('meta_connection_context', 'token');
    } else {
      setError('Failed to fetch ad accounts');
    }
    
    toast({
      title: "Error",
      description: "Failed to load Meta ad accounts",
      variant: "destructive"
    });
  };

  return {
    adAccounts,
    isLoading,
    error,
    fetchAdAccounts,
    setAdAccounts
  };
}
