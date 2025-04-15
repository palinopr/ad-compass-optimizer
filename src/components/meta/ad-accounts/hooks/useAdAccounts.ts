
import { useState, useEffect, useCallback } from 'react';
import { useAdAccountsFetching } from './useAdAccountsFetching';
import { toast } from '@/hooks/use-toast';

export const useAdAccounts = () => {
  const { 
    adAccounts, 
    isLoading, 
    error, 
    fetchAdAccounts
  } = useAdAccountsFetching();
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
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
      
      toast({
        title: "Ad Account Selected",
        description: `${firstAccount.name} has been automatically selected.`
      });

      // Trigger campaign refresh
      window.dispatchEvent(new CustomEvent('ad-account-changed', { 
        detail: { accountId } 
      }));
    }
  }, [adAccounts, selectedAccount]);
  
  const handleAccountChange = useCallback((value: string) => {
    console.log('[META] Account selection changed to:', value);
    
    const accountId = value.replace(/^act_/, '');
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    
    const selectedAccountObj = adAccounts.find(acc => acc.id === value);
    
    toast({
      title: "Ad Account Changed",
      description: selectedAccountObj ? 
        `Switched to ${selectedAccountObj.name}` : 
        "Ad account selection updated"
    });
    
    window.dispatchEvent(new CustomEvent('ad-account-changed', { 
      detail: { accountId } 
    }));
  }, [adAccounts]);

  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
