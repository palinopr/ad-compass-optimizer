
import { useEffect } from 'react';
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
  
  const { selectedAccount, handleAccountChange } = useAdAccountSelection(adAccounts);
  
  // Safe account change handler with error handling
  const safeHandleAccountChange = (accountId: string) => {
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
  };
  
  // Trigger account change event when component mounts with a selected account
  useEffect(() => {
    try {
      if (selectedAccount && Array.isArray(adAccounts) && adAccounts.length > 0) {
        const account = adAccounts.find(acc => 
          acc && acc.id && acc.id.replace(/^act_/, '') === selectedAccount
        );
        
        if (account) {
          console.log('[META] Component mounted with selected account:', account.name);
          
          // Notify that we have a selected account
          try {
            window.dispatchEvent(new CustomEvent('ad-account-changed', { 
              detail: { accountId: selectedAccount } 
            }));
            
            toast({
              title: "Ad Account Active",
              description: `Using ${account.name}`
            });
          } catch (eventErr) {
            console.error('[META] Error dispatching account change event:', eventErr);
          }
        }
      }
    } catch (err) {
      console.error('[META] Error in useEffect for selected account:', err);
    }
  }, [adAccounts, selectedAccount]);

  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange: safeHandleAccountChange
  };
};
