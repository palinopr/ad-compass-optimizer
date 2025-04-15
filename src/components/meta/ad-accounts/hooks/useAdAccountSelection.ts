
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdAccount } from '../types';

export function useAdAccountSelection(adAccounts: AdAccount[]) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize selection from localStorage or default to first account
  useEffect(() => {
    try {
      const storedAccountId = localStorage.getItem('selected_ad_account');
      if (storedAccountId && adAccounts.some(acc => acc.id.replace(/^act_/, '') === storedAccountId.replace(/^act_/, ''))) {
        console.log('[META] Using stored account selection:', storedAccountId);
        setSelectedAccount(storedAccountId);
      } else if (adAccounts.length > 0) {
        // Default to first valid account
        const firstAccount = adAccounts[0];
        const accountId = firstAccount.id.replace(/^act_/, '');
        console.log('[META] No valid stored account, defaulting to first account:', accountId);
        setSelectedAccount(accountId);
        localStorage.setItem('selected_ad_account', accountId);
      }
    } catch (e) {
      console.error('[META] Error initializing account selection:', e);
      setError('Error loading account selection');
    }
  }, [adAccounts]);

  const handleAccountChange = useCallback((value: string) => {
    if (!value) {
      console.warn('[META] Empty account ID provided to handleAccountChange');
      return;
    }

    try {
      // Validate account exists in fetched accounts
      const accountExists = adAccounts.some(acc => 
        acc.id.replace(/^act_/, '') === value.replace(/^act_/, '')
      );

      if (!accountExists) {
        console.error('[META] Selected account not found in available accounts:', value);
        toast({
          title: "Invalid Account Selection",
          description: "The selected account is not available. Please choose a valid account.",
          variant: "destructive"
        });
        return;
      }

      console.log('[META] Account selection change initiated:', value);
      
      // Store without 'act_' prefix for consistency
      const accountId = value.replace(/^act_/, '');
      console.log('[META] Normalized account ID for storage:', accountId);
      
      // Update state
      setSelectedAccount(accountId);
      setError(null);
      
      // Update localStorage
      localStorage.setItem('selected_ad_account', accountId);
      
      // Show toast notification
      toast({
        title: "Ad Account Selected",
        description: "Your ad account selection has been updated."
      });

      // Dispatch events for account change
      const event = new CustomEvent('ad-account-changed', { 
        detail: { accountId } 
      });
      window.dispatchEvent(event);

      // Trigger campaign data refresh
      const refreshEvent = new CustomEvent('campaign-data-refresh', {
        detail: { force: true }
      });
      window.dispatchEvent(refreshEvent);

    } catch (err) {
      console.error('[META] Error in account change handler:', err);
      setError('Failed to change account');
      toast({
        title: "Error",
        description: "Failed to change ad account. Please try again.",
        variant: "destructive"
      });
    }
  }, [adAccounts, toast]);

  return {
    selectedAccount,
    error,
    handleAccountChange
  };
}
