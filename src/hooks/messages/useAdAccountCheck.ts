
import { useCallback } from 'react';

export const useAdAccountCheck = () => {
  const checkForAdAccount = useCallback(() => {
    try {
      console.log("Checking for ad accounts...");
      const selectedAccount = localStorage.getItem('selected_ad_account');
      if (selectedAccount && selectedAccount.length > 0) {
        console.log("Found selected ad account:", selectedAccount);
        return true;
      }
      
      const selectedAccountsStr = localStorage.getItem('selected_ad_accounts');
      if (!selectedAccountsStr) {
        console.log("No selected ad accounts found");
        return false;
      }
      
      const selectedAccounts = JSON.parse(selectedAccountsStr);
      const hasAccounts = Array.isArray(selectedAccounts) && selectedAccounts.length > 0;
      console.log("Selected ad accounts check result:", hasAccounts, selectedAccounts);
      return hasAccounts;
    } catch (e) {
      console.error('Error checking ad accounts:', e);
      localStorage.removeItem('selected_ad_accounts');
      return false;
    }
  }, []);
  
  const loadStoredAdAccounts = useCallback(() => {
    try {
      const accountsStr = localStorage.getItem('selected_ad_accounts');
      if (accountsStr) {
        const accounts = JSON.parse(accountsStr);
        if (Array.isArray(accounts) && accounts.length > 0) {
          console.log("Loaded stored ad accounts:", accounts);
          return accounts;
        }
      }
      
      const singleAccount = localStorage.getItem('selected_ad_account');
      if (singleAccount) {
        console.log("Loaded single stored ad account:", singleAccount);
        return [singleAccount];
      }
      
      return [];
    } catch (e) {
      console.error('Error loading ad accounts:', e);
      return [];
    }
  }, []);

  return {
    checkForAdAccount,
    loadStoredAdAccounts
  };
};
