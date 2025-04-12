
import { useEffect } from 'react';
import { useAdAccountsFetching } from './hooks/useAdAccountsFetching';
import { useAdAccountSelection } from './hooks/useAdAccountSelection';

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
    fetchAdAccounts();
  }, []);
  
  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
