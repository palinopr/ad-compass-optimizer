
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdAccount } from '../types';

export function useAdAccountSelection(adAccounts: AdAccount[]) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize selection from localStorage
  useEffect(() => {
    const storedAccountId = localStorage.getItem('selected_ad_account');
    if (storedAccountId) {
      console.log('Using stored account selection:', storedAccountId);
      setSelectedAccount(storedAccountId);
    }
  }, []);
  
  const handleAccountChange = (value: string) => {
    // Store without 'act_' prefix for consistency
    const accountId = value.replace(/^act_/, '');
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    
    // Update selected_ad_accounts as well to maintain consistency
    localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
    
    toast({
      title: "Ad Account Selected",
      description: "Your ad account selection has been updated."
    });
    
    // Reload campaign data by forcing a page refresh
    // This ensures the campaigns component re-fetches data with the new account
    window.location.reload();
  };
  
  // Select first account if none selected but accounts are available
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      // Store without 'act_' prefix for consistency
      const accountId = adAccounts[0].id.replace(/^act_/, '');
      setSelectedAccount(accountId);
      localStorage.setItem('selected_ad_account', accountId);
      localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
      console.log(`Selected first available account: ${accountId}`);
    }
  }, [adAccounts, selectedAccount]);
  
  return {
    selectedAccount,
    handleAccountChange
  };
}
