
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useAdAccountSelection() {
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  
  // Get the selected ad account
  const getSelectedAdAccount = useCallback(() => {
    try {
      // First check for direct account selection
      const selectedAccountId = localStorage.getItem('selected_ad_account');
      
      if (selectedAccountId) {
        // Format it properly for API calls (with or without 'act_' prefix)
        const formattedAccountId = selectedAccountId.startsWith('act_') 
          ? selectedAccountId 
          : `act_${selectedAccountId}`;
          
        console.log(`Selected ad account: ${formattedAccountId}`);
        
        return {
          hasAccount: true,
          adAccountId: formattedAccountId
        };
      }
      
      // If no direct selection, check for selected accounts array
      const selectedAccountsStr = localStorage.getItem('selected_ad_accounts');
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
            localStorage.setItem('selected_ad_account', accountId);
            
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
      // Store the account ID
      const cleanAccountId = accountId.replace(/^act_/, '');
      localStorage.setItem('selected_ad_account', cleanAccountId);
      localStorage.setItem('selected_ad_accounts', JSON.stringify([cleanAccountId]));
      
      // Dispatch the account change event
      const event = new CustomEvent('ad-account-changed', { 
        detail: { accountId: cleanAccountId } 
      });
      window.dispatchEvent(event);
      
      // Also trigger a refresh of campaign data
      const refreshEvent = new CustomEvent('campaign-data-refresh', {
        detail: { force: true }
      });
      window.dispatchEvent(refreshEvent);
      
      toast({
        title: "Ad Account Changed",
        description: `Switched to account ${cleanAccountId}`
      });
      
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
