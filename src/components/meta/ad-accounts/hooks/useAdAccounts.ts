
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
  
  // Trigger account change event when component mounts with a selected account
  useEffect(() => {
    if (selectedAccount && adAccounts.length > 0) {
      const account = adAccounts.find(acc => acc.id.replace(/^act_/, '') === selectedAccount);
      if (account) {
        console.log('[META] Component mounted with selected account:', account.name);
        
        // Notify that we have a selected account
        window.dispatchEvent(new CustomEvent('ad-account-changed', { 
          detail: { accountId: selectedAccount } 
        }));
        
        toast({
          title: "Ad Account Active",
          description: `Using ${account.name}`
        });
      }
    }
  }, [adAccounts, selectedAccount]);

  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
