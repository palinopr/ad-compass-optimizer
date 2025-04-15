
import { useState, useEffect, useCallback } from 'react';
import { useAdAccountsFetching } from './useAdAccountsFetching';
import { toast } from '@/hooks/use-toast';

export const useAdAccounts = () => {
  const { 
    adAccounts, 
    isLoading, 
    error,
    errorRef, 
    fetchAdAccounts,
    setAdAccounts 
  } = useAdAccountsFetching();
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  
  // Set up initial fetch on load
  useEffect(() => {
    console.log('[META] Initializing useAdAccounts hook');
    
    // Initial fetch with retry logic on failure
    const performInitialFetch = async () => {
      try {
        await fetchAdAccounts();
      } catch (err) {
        console.error('[META] Failed to fetch ad accounts on initial load:', err);
        
        if (retryCount < 2) {
          console.log(`[META] Retrying fetch (attempt ${retryCount + 1})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(performInitialFetch, 1000);
        }
      }
    };
    
    performInitialFetch();
    
    // Set up event listeners for account refresh
    window.addEventListener('refresh-ad-accounts', fetchAdAccounts);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('refresh-ad-accounts', fetchAdAccounts);
    };
  }, [fetchAdAccounts, retryCount]);
  
  // Initialize selected account from localStorage
  useEffect(() => {
    const storedAccount = localStorage.getItem('selected_ad_account');
    if (storedAccount) {
      console.log('[META] Using stored account selection:', storedAccount);
      setSelectedAccount(storedAccount);
    }
  }, []);
  
  // Auto-select first account if no account is selected
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      const firstAccount = adAccounts[0];
      const accountId = firstAccount.id.replace(/^act_/, '');
      console.log('[META] Auto-selecting first account:', accountId);
      setSelectedAccount(accountId);
      localStorage.setItem('selected_ad_account', accountId);
      
      // Show toast notification
      toast({
        title: "Ad Account Selected",
        description: `${firstAccount.name} has been automatically selected.`
      });
    }
  }, [adAccounts, selectedAccount]);
  
  // Handle account change
  const handleAccountChange = useCallback((value: string) => {
    console.log('[META] Account selection changed to:', value);
    
    // Normalize account ID (remove 'act_' prefix if present)
    const accountId = value.replace(/^act_/, '');
    
    // Update state and localStorage
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    
    // Update selected_ad_accounts for consistency
    localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
    
    // Show toast notification
    toast({
      title: "Ad Account Selected",
      description: "Your ad account selection has been updated."
    });
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('ad-account-changed', { 
      detail: { accountId } 
    }));
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
