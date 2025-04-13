
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
  
  // Separated event handler for better error handling
  const handleRefreshEvent = useCallback(() => {
    console.log('Ad account refresh event received');
    fetchAdAccounts();
  }, [fetchAdAccounts]);
  
  // Fetch ad accounts on initial load and set up event listeners
  useEffect(() => {
    console.log('Initializing ad accounts component');
    
    // Initial fetch
    fetchAdAccounts();
    
    // Set up event listeners
    window.addEventListener('refresh-ad-accounts', handleRefreshEvent);
    window.addEventListener('campaign-data-refresh', handleRefreshEvent);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('refresh-ad-accounts', handleRefreshEvent);
      window.removeEventListener('campaign-data-refresh', handleRefreshEvent);
    };
  }, [fetchAdAccounts, handleRefreshEvent]);
  
  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
