
import { useEffect, useCallback } from 'react';
import { useAdAccountsFetching } from './useAdAccountsFetching';
import { useAdAccountSelection } from './useAdAccountSelection';
import { toast } from '@/hooks/use-toast';

export const useAdAccounts = () => {
  const { 
    adAccounts, 
    isLoading, 
    error, 
    fetchAdAccounts
  } = useAdAccountsFetching();
  
  // Log account data for debugging
  useEffect(() => {
    console.log('[META AD ACCOUNTS] Available accounts in useAdAccounts:', 
      adAccounts ? `${adAccounts.length} accounts` : 'No accounts');
    
    if (Array.isArray(adAccounts) && adAccounts.length > 0) {
      adAccounts.forEach((acc, idx) => {
        if (acc) {
          console.log(`[META AD ACCOUNTS] Account ${idx + 1}:`, {
            id: acc.id,
            name: acc.name
          });
        }
      });
    }
  }, [adAccounts]);
  
  const { selectedAccount, handleAccountChange } = useAdAccountSelection(adAccounts || []);
  
  // Safe account change handler with error handling
  const safeHandleAccountChange = useCallback((accountId: string) => {
    if (!accountId) {
      console.warn('[META] Empty account ID provided to safeHandleAccountChange');
      return;
    }
    
    try {
      console.log('[META] Changing account to:', accountId);
      handleAccountChange(accountId);
    } catch (err) {
      console.error('[META] Error in account change:', err);
      toast({
        title: "Error Changing Account",
        description: "Failed to change the ad account. Please try again.",
        variant: "destructive"
      });
    }
  }, [handleAccountChange]);
  
  // Trigger account change event when component mounts with a selected account
  useEffect(() => {
    if (!selectedAccount || !Array.isArray(adAccounts) || adAccounts.length === 0) {
      return;
    }
    
    try {
      const account = adAccounts.find(acc => 
        acc && acc.id && acc.id.replace(/^act_/, '') === selectedAccount
      );
      
      if (account) {
        console.log('[META] Component mounted with selected account:', account.name);
        
        // Notify that we have a selected account
        try {
          const event = new CustomEvent('ad-account-changed', { 
            detail: { accountId: selectedAccount } 
          });
          window.dispatchEvent(event);
          
          toast({
            title: "Ad Account Active",
            description: `Using ${account.name}`
          });
        } catch (eventErr) {
          console.error('[META] Error dispatching account change event:', eventErr);
        }
      }
    } catch (err) {
      console.error('[META] Error in useEffect for selected account:', err);
    }
  }, [adAccounts, selectedAccount]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshRequest = () => {
      console.log('[META] Refresh ad accounts event received');
      fetchAdAccounts();
    };
    
    window.addEventListener('refresh-ad-accounts', handleRefreshRequest);
    return () => {
      window.removeEventListener('refresh-ad-accounts', handleRefreshRequest);
    };
  }, [fetchAdAccounts]);

  return {
    adAccounts: adAccounts || [],
    selectedAccount: selectedAccount || '',
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange: safeHandleAccountChange
  };
};
