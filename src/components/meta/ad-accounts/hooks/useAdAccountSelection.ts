
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
    try {
      // Store without 'act_' prefix for consistency
      const accountId = value.replace(/^act_/, '');
      
      console.log('Changing ad account to:', accountId);
      
      // Update state
      setSelectedAccount(accountId);
      
      // Update localStorage
      localStorage.setItem('selected_ad_account', accountId);
      
      // Update selected_ad_accounts as well to maintain consistency
      localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
      
      // Show toast notification
      toast({
        title: "Ad Account Selected",
        description: "Your ad account selection has been updated."
      });
      
      // Safely dispatch events with error handling
      console.log('Dispatching ad-account-changed event');
      const accountEvent = new CustomEvent('ad-account-changed', { 
        detail: { accountId } 
      });
      window.dispatchEvent(accountEvent);
      
      // Using setTimeout to ensure events are processed sequentially
      setTimeout(() => {
        console.log('Dispatching campaign-data-refresh event');
        const refreshEvent = new CustomEvent('campaign-data-refresh');
        window.dispatchEvent(refreshEvent);
      }, 200);
    } catch (err) {
      console.error('Error in account change handler:', err);
      toast({
        title: "Error",
        description: "There was an error changing your ad account.",
        variant: "destructive"
      });
    }
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
