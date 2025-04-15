
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export function useAdAccountSelection() {
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  
  // Get the selected ad account
  const getSelectedAdAccount = useCallback(() => {
    try {
      // First check for direct account selection
      let selectedAccountId;
      
      try {
        selectedAccountId = localStorage.getItem('selected_ad_account');
        console.log('[META] Retrieved selected account from localStorage:', selectedAccountId);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return {
          hasAccount: false,
          error: 'Error accessing localStorage',
          errorDetails: { error: e }
        };
      }
      
      if (selectedAccountId) {
        // Format it properly for API calls (with or without 'act_' prefix)
        const formattedAccountId = selectedAccountId.startsWith('act_') 
          ? selectedAccountId 
          : `act_${selectedAccountId}`;
          
        console.log(`[META] Selected ad account: ${formattedAccountId}`);
        
        return {
          hasAccount: true,
          adAccountId: formattedAccountId
        };
      }
      
      // If no direct selection, check for selected accounts array
      let selectedAccountsStr;
      try {
        selectedAccountsStr = localStorage.getItem('selected_ad_accounts');
      } catch (e) {
        console.error('Error accessing localStorage for accounts array:', e);
        return {
          hasAccount: false,
          error: 'Error accessing localStorage',
          errorDetails: { error: e }
        };
      }
      
      if (selectedAccountsStr) {
        try {
          const selectedAccounts = JSON.parse(selectedAccountsStr);
          if (selectedAccounts && selectedAccounts.length > 0) {
            // Use the first one
            const accountId = selectedAccounts[0];
            const formattedAccountId = accountId.startsWith('act_') 
              ? accountId 
              : `act_${accountId}`;
              
            // Also save it as the selected_ad_account for consistency
            try {
              localStorage.setItem('selected_ad_account', accountId);
              console.log(`[META] Updated selected_ad_account in localStorage to ${accountId}`);
            } catch (e) {
              console.error('Error setting localStorage item:', e);
            }
            
            return {
              hasAccount: true,
              adAccountId: formattedAccountId
            };
          }
        } catch (e) {
          console.error('Error parsing selected accounts:', e);
        }
      }
      
      // If no account is found, note this in an error
      return {
        hasAccount: false,
        error: 'No ad account selected. Please select an ad account first.',
        errorDetails: {
          code: 'NO_AD_ACCOUNT',
          isAccountError: true
        }
      };
    } catch (e) {
      console.error('Error getting selected ad account:', e);
      return {
        hasAccount: false,
        error: `Error getting ad account: ${String(e)}`,
        errorDetails: {
          code: 'AD_ACCOUNT_ERROR', 
          error: e
        }
      };
    }
  }, []);
  
  // This function will switch to a specific account and notify the system
  const switchToAccount = useCallback((accountId: string) => {
    try {
      if (!accountId) {
        console.error('[META] Invalid account ID provided to switchToAccount');
        return false;
      }
      
      // Store the account ID
      const cleanAccountId = accountId.replace(/^act_/, '');
      console.log(`[META] Switching to account: ${cleanAccountId}`);
      
      try {
        localStorage.setItem('selected_ad_account', cleanAccountId);
        localStorage.setItem('selected_ad_accounts', JSON.stringify([cleanAccountId]));
        console.log('[META] Saved account selection to localStorage');
      } catch (e) {
        console.error('Error setting localStorage:', e);
        toast({
          title: "Storage Error",
          description: "Could not save account selection. Please check browser permissions.",
          variant: "destructive"
        });
        return false;
      }
      
      // Show loading toast
      toast({
        title: "Switching ad account...",
        description: "Loading campaigns for the selected account",
        duration: 2000
      });
      
      // Dispatch the account change event
      try {
        const event = new CustomEvent('ad-account-changed', { 
          detail: { accountId: cleanAccountId } 
        });
        window.dispatchEvent(event);
        console.log('[META] Dispatched ad-account-changed event');
      } catch (e) {
        console.error('Error dispatching account change event:', e);
      }
      
      // Trigger campaign data refresh
      try {
        const refreshEvent = new CustomEvent('campaign-data-refresh', {
          detail: { force: true }
        });
        window.dispatchEvent(refreshEvent);
        console.log('[META] Dispatched campaign-data-refresh event');
      } catch (e) {
        console.error('Error dispatching refresh event:', e);
      }
      
      return true;
    } catch (e) {
      console.error('Error switching accounts:', e);
      
      toast({
        title: "Account Switch Failed",
        description: "Error changing ad account",
        variant: "destructive"
      });
      
      return false;
    }
  }, []);
  
  return {
    getSelectedAdAccount,
    switchToAccount
  };
}
