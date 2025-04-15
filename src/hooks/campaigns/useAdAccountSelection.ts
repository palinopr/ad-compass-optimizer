import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { MetaAdAccountService } from '@/services/api/MetaAdAccountService';

export function useAdAccountSelection() {
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  
  // Get the selected ad account with fallback
  const getSelectedAdAccount = useCallback(async () => {
    try {
      // First check for direct account selection
      let selectedAccountId = localStorage.getItem('selected_ad_account');
      
      if (selectedAccountId) {
        const formattedAccountId = selectedAccountId.startsWith('act_') 
          ? selectedAccountId 
          : `act_${selectedAccountId}`;
          
        console.log(`[META] Using explicitly selected ad account: ${formattedAccountId}`);
        
        return {
          hasAccount: true,
          adAccountId: formattedAccountId
        };
      }
      
      // If no account is selected, try to get the first active account
      console.log('[META] No account selected, attempting to find first active account...');
      
      const token = localStorage.getItem('meta_access_token');
      if (!token) {
        return {
          hasAccount: false,
          error: 'No Meta access token found',
          errorDetails: { code: 'NO_TOKEN' }
        };
      }
      
      const accounts = await MetaAdAccountService.fetchAdAccounts(token);
      const activeAccount = accounts.find(acc => acc.account_status === 1);
      
      if (activeAccount) {
        const accountId = activeAccount.id.replace(/^act_/, '');
        console.log(`[META] Found active account ${accountId}, setting as default`);
        
        // Store this account as selected
        localStorage.setItem('selected_ad_account', accountId);
        localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
        
        return {
          hasAccount: true,
          adAccountId: `act_${accountId}`,
          isDefaultAccount: true
        };
      }
      
      return {
        hasAccount: false,
        error: 'No active ad accounts found',
        errorDetails: {
          code: 'NO_ACTIVE_ACCOUNTS',
          isAccountError: true
        }
      };
    } catch (e) {
      console.error('[META] Error getting selected ad account:', e);
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
        
        // NEW: Force immediate campaign fetch after account selection
        console.log('[CAMPAIGN FETCH] Triggering immediate fetch after account selection');
        const fetchEvent = new CustomEvent('campaign-data-refresh', { 
          detail: { 
            force: true,
            accountId: cleanAccountId,
            immediate: true 
          } 
        });
        window.dispatchEvent(fetchEvent);
      } catch (e) {
        console.error('Error dispatching account change event:', e);
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
