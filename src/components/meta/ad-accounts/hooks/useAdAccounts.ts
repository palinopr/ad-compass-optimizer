
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
    console.log('Initializing ad accounts component');
    fetchAdAccounts();
    
    // Listen for refresh events
    const handleRefresh = () => {
      console.log('Ad account refresh event received');
      fetchAdAccounts();
    };
    
    window.addEventListener('refresh-ad-accounts', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-ad-accounts', handleRefresh);
    };
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
