
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { MetaAdAccountService } from '@/services/api/MetaAdAccountService';
import { metaAuthService } from '@/services/MetaAuthService';

export function useAdAccountSelection() {
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<{
    hasAccount: boolean;
    adAccountId?: string;
    error?: string;
    errorDetails?: any;
    isDefaultAccount?: boolean;
  }>({
    hasAccount: false
  });
  
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
      
      const token = metaAuthService.getAccessToken();
      if (!token) {
        return {
          hasAccount: false,
          error: 'No Meta access token found',
          errorDetails: { code: 'NO_TOKEN' }
        };
      }
      
      // Make a real API call to get ad accounts, do not use mock data
      console.log('[META] Fetching ad accounts from live API...');
      try {
        const accounts = await MetaAdAccountService.fetchAdAccounts(token);
        
        if (!accounts || accounts.length === 0) {
          console.error('[META] No ad accounts found from API call');
          return {
            hasAccount: false,
            error: 'No ad accounts found',
            errorDetails: { 
              code: 'NO_ACCOUNTS',
              isAccountError: true
            }
          };
        }
        
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
        
        // If no active account found but we have accounts, use the first one
        if (accounts.length > 0) {
          const firstAccount = accounts[0];
          const accountId = firstAccount.id.replace(/^act_/, '');
          console.log(`[META] No active accounts found, using first available: ${accountId}`);
          
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
      } catch (apiError) {
        console.error('[META] API error getting accounts:', apiError);
        return {
          hasAccount: false,
          error: `Error fetching ad accounts: ${String(apiError)}`,
          errorDetails: {
            code: 'AD_ACCOUNT_FETCH_ERROR',
            error: apiError
          }
        };
      }
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
      
      // Update the selected account state
      setSelectedAccount({
        hasAccount: true,
        adAccountId: `act_${cleanAccountId}`
      });
      
      // Dispatch the account change event
      try {
        const event = new CustomEvent('ad-account-changed', { 
          detail: { accountId: cleanAccountId } 
        });
        window.dispatchEvent(event);
        console.log('[META] Dispatched ad-account-changed event');
        
        // Force immediate campaign fetch after account selection
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
  
  // Effect to initialize the selected account
  useEffect(() => {
    const initializeSelectedAccount = async () => {
      console.log('[META] Initializing selected account...');
      const accountInfo = await getSelectedAdAccount();
      console.log('[META] Account initialization complete:', accountInfo);
      setSelectedAccount(accountInfo);
    };
    
    initializeSelectedAccount();
  }, [getSelectedAdAccount]);
  
  // Return both the sync state and the async function
  return {
    selectedAccount, // Synchronous state
    getSelectedAdAccount, // Async function for refreshing
    switchToAccount
  };
}
