
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdAccount } from '../types';

export function useAdAccountSelection(adAccounts: AdAccount[]) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize selection from localStorage
  useEffect(() => {
    try {
      const storedAccountId = localStorage.getItem('selected_ad_account');
      if (storedAccountId) {
        console.log('[META] Using stored account selection:', storedAccountId);
        setSelectedAccount(storedAccountId);
      }
    } catch (e) {
      console.error('[META] Error loading stored account:', e);
    }
  }, []);
  
  // Safe event dispatcher that won't freeze the UI
  const safeDispatchEvent = useCallback((eventName: string, detail?: any) => {
    console.log(`[META] Dispatching ${eventName} event`);
    try {
      // Use requestAnimationFrame to ensure UI updates first
      window.requestAnimationFrame(() => {
        try {
          const event = new CustomEvent(eventName, { detail });
          window.dispatchEvent(event);
        } catch (err) {
          console.error(`[META] Inner error dispatching ${eventName} event:`, err);
        }
      });
    } catch (err) {
      console.error(`[META] Error dispatching ${eventName} event:`, err);
    }
  }, []);
  
  const handleAccountChange = useCallback((value: string) => {
    if (!value) {
      console.warn('[META] Empty account ID provided to handleAccountChange');
      return;
    }
    
    try {
      // Prevent default event behavior to avoid page reloads
      console.log('[META] Account selection change initiated:', value);
      
      // Store without 'act_' prefix for consistency
      const accountId = value.replace(/^act_/, '');
      
      console.log('[META] Normalized account ID for storage:', accountId);
      
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
      
      // Find the selected account for logging
      const selectedAccountDetails = adAccounts.find(acc => 
        acc && acc.id && acc.id.replace(/^act_/, '') === accountId
      );
      
      console.log('[META] Selected account details:', selectedAccountDetails || 'Not found in current list');
      
      // Use the safe event dispatcher with a slight delay to prevent UI freezing
      setTimeout(() => {
        safeDispatchEvent('ad-account-changed', { accountId });
        
        // Allow a small delay between events
        setTimeout(() => {
          safeDispatchEvent('campaign-data-refresh');
          
          // Also dispatch refresh-ad-accounts event to ensure consistency
          setTimeout(() => {
            safeDispatchEvent('refresh-ad-accounts');
          }, 100);
        }, 100);
      }, 50);
    } catch (err) {
      console.error('[META] Error in account change handler:', err);
      toast({
        title: "Error",
        description: "There was an error changing your ad account.",
        variant: "destructive"
      });
    }
  }, [adAccounts, toast, safeDispatchEvent]);
  
  // Select first account if none selected but accounts are available
  useEffect(() => {
    if (Array.isArray(adAccounts) && adAccounts.length > 0 && !selectedAccount) {
      try {
        const firstValidAccount = adAccounts.find(acc => acc && acc.id);
        
        if (firstValidAccount) {
          // Store without 'act_' prefix for consistency
          const accountId = firstValidAccount.id.replace(/^act_/, '');
          console.log(`[META] Selecting first available account: ${accountId}`);
          
          setSelectedAccount(accountId);
          localStorage.setItem('selected_ad_account', accountId);
          localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
        } else {
          console.warn('[META] No valid accounts found in the list');
        }
      } catch (e) {
        console.error('[META] Error selecting first account:', e);
      }
    }
  }, [adAccounts, selectedAccount]);
  
  return {
    selectedAccount,
    handleAccountChange
  };
}
