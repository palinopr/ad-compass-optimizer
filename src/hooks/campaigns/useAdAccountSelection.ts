
import { useCallback } from 'react';

export function useAdAccountSelection() {
  const getSelectedAdAccount = useCallback(() => {
    // First check for a directly selected ad account
    let adAccountId = localStorage.getItem('selected_ad_account');
    console.log('Direct ad account selection:', adAccountId);
    
    // If not found, try to get from selected_ad_accounts
    if (!adAccountId) {
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      console.log('Selected ad accounts from storage:', selectedAdAccounts);
      
      if (selectedAdAccounts) {
        try {
          const accounts = JSON.parse(selectedAdAccounts);
          if (Array.isArray(accounts) && accounts.length > 0) {
            adAccountId = accounts[0]; // Use the first selected ad account
            console.log('Using first account from array:', adAccountId);
          }
        } catch (e) {
          console.error('Error parsing selected ad accounts:', e);
        }
      }
    }
    
    if (!adAccountId) {
      console.log('No ad account selected');
      const error = 'No ad account selected. Please select an ad account to view campaigns.';
      const errorDetails = {
        error: {
          type: 'NO_AD_ACCOUNT',
          message: 'No ad account selected. You need to select an ad account to view campaign data.'
        }
      };
      return { hasAccount: false, error, errorDetails };
    }
    
    // Format the ad account ID properly
    let formattedAccountId = adAccountId;
    if (adAccountId.startsWith('act_')) {
      // For storage consistency, strip the prefix
      localStorage.setItem('selected_ad_account', adAccountId.substring(4));
      formattedAccountId = adAccountId;
    } else {
      // For API call, ensure it has the prefix
      formattedAccountId = `act_${adAccountId}`;
    }
    
    return { 
      hasAccount: true,
      adAccountId: formattedAccountId,
      cleanAccountId: adAccountId.startsWith('act_') ? adAccountId.substring(4) : adAccountId
    };
  }, []);

  return { getSelectedAdAccount };
}
