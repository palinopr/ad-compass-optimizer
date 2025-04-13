
import { useState, useEffect, useCallback } from 'react';
import { useAdAccountsFetching } from './useAdAccountsFetching';
import { useAdAccountSelection } from './useAdAccountSelection';
import { AdAccount } from '../types';

export const useAdAccounts = () => {
  const { 
    adAccounts, 
    isLoading, 
    error, 
    fetchAdAccounts,
    setAdAccounts 
  } = useAdAccountsFetching();
  
  const { selectedAccount, handleAccountChange } = useAdAccountSelection(adAccounts);
  
  const [retryCount, setRetryCount] = useState(0);
  
  // Handler for refresh events with debouncing
  const handleRefreshEvent = useCallback(() => {
    console.log('Ad account refresh event received');
    fetchAdAccounts();
  }, [fetchAdAccounts]);
  
  // Fetch ad accounts on initial load and set up event listeners
  useEffect(() => {
    console.log('Initializing useAdAccounts hook');
    
    let isMounted = true;
    
    // Initial fetch with retry logic on failure
    const performInitialFetch = async () => {
      try {
        await fetchAdAccounts();
      } catch (err) {
        console.error('Failed to fetch ad accounts on initial load:', err);
        if (isMounted && retryCount < 2) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(performInitialFetch, 1000); // Retry after 1 second
        }
      }
    };
    
    performInitialFetch();
    
    // Set up event listeners with debouncing
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const debouncedRefresh = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleRefreshEvent, 300);
    };
    
    // Set up event listeners for all possible refresh events
    window.addEventListener('refresh-ad-accounts', debouncedRefresh);
    window.addEventListener('campaign-data-refresh', debouncedRefresh);
    window.addEventListener('ad-account-changed', debouncedRefresh);
    
    // Clean up event listeners on unmount
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      window.removeEventListener('refresh-ad-accounts', debouncedRefresh);
      window.removeEventListener('campaign-data-refresh', debouncedRefresh);
      window.removeEventListener('ad-account-changed', debouncedRefresh);
    };
  }, [fetchAdAccounts, handleRefreshEvent, retryCount]);
  
  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
