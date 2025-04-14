
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { AdAccount } from '../types';
import { getMockAdAccount } from '../utils/mockAccountData';
import { fetchSelectedAccounts, fetchAllAccounts } from '../utils/fetchUtils';
import { useAdAccountsError } from './useAdAccountsError';

export function useAdAccountsFetching() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { handleFetchError } = useAdAccountsError();
  
  const isMockMode = () => localStorage.getItem("USE_MOCK_MODE") === "true";
  
  useEffect(() => {
    if (isMockMode()) {
      setAdAccounts([getMockAdAccount()]);
    }
  }, []);
  
  const fetchAdAccounts = async () => {
    if (isMockMode()) {
      console.log('🎭 Mock mode: Using mock ad accounts');
      setAdAccounts([getMockAdAccount()]);
      setIsLoading(false);
      return;
    }
    
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
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      let selectedIds: string[] = [];
      
      if (selectedAdAccounts) {
        try {
          selectedIds = JSON.parse(selectedAdAccounts);
          console.log('Found selected ad accounts in storage:', selectedIds);
        } catch (e) {
          console.error('Error parsing selected ad accounts:', e);
          localStorage.removeItem('selected_ad_accounts');
        }
      }
      
      let fetchedAccounts: AdAccount[] = [];
      
      if (selectedIds.length > 0) {
        fetchedAccounts = await fetchSelectedAccounts(selectedIds, accessToken);
        
        if (fetchedAccounts.length === 0) {
          console.log('No valid accounts found from stored IDs, fetching all available accounts');
          fetchedAccounts = await fetchAllAccounts(accessToken);
        }
      } else {
        console.log('No stored accounts, fetching all available accounts');
        fetchedAccounts = await fetchAllAccounts(accessToken);
      }
      
      console.log('Successfully fetched accounts:', fetchedAccounts.length);
      setAdAccounts(fetchedAccounts);
      
    } catch (err) {
      const { error: errorMessage, shouldReconnect } = handleFetchError(err);
      setError(errorMessage);
      if (shouldReconnect) {
        localStorage.setItem('show_meta_connection', 'true');
        localStorage.setItem('meta_connection_context', 'token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    adAccounts,
    isLoading,
    error,
    fetchAdAccounts,
    setAdAccounts
  };
}

