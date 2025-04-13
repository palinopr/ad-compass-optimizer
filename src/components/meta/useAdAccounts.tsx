
import { useEffect } from 'react';
import { useAdAccountsFetching } from './ad-accounts/hooks/useAdAccountsFetching';
import { useAdAccountSelection } from './ad-accounts/hooks/useAdAccountSelection';

export const useAdAccounts = () => {
  const { 
    adAccounts, 
    isLoading, 
    error, 
    fetchAdAccounts 
  } = useAdAccountsFetching();
  
  const { selectedAccount, handleAccountChange } = useAdAccountSelection(adAccounts);
  
  // Fetch ad accounts on initial load
  useEffect(() => {
    console.log('useAdAccounts hook initialized');
    fetchAdAccounts();
    
    // Listen for refresh events
    const handleRefresh = () => {
      console.log('Refresh event received in useAdAccounts');
      fetchAdAccounts();
    };
    
    window.addEventListener('refresh-ad-accounts', handleRefresh);
    window.addEventListener('ad-account-changed', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-ad-accounts', handleRefresh);
      window.removeEventListener('ad-account-changed', handleRefresh);
    };
  }, [fetchAdAccounts]);
  
  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
