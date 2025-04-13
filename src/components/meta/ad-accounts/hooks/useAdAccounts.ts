
import { useState, useEffect } from 'react';
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
