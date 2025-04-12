
import { useState, useEffect, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

type ComponentState = 'loading' | 'not_authenticated' | 'no_ad_account' | 'ready';

export interface MessagesPageState {
  componentState: ComponentState;
  adAccounts: any[];
  isAuthenticated: boolean;
}

export const useMessagesPageState = () => {
  const { isAuthenticated, checkAuth, showConnectionDialog } = useMetaConnection();
  const [componentState, setComponentState] = useState<ComponentState>('loading');
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  
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
          setAdAccounts(accounts);
          return true;
        }
      }
      
      const singleAccount = localStorage.getItem('selected_ad_account');
      if (singleAccount) {
        console.log("Loaded single stored ad account:", singleAccount);
        setAdAccounts([singleAccount]);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Error loading ad accounts:', e);
      return false;
    }
  }, []);
  
  const determineComponentState = useCallback(async () => {
    console.log("Determining component state...");
    
    const token = metaAuthService.getAccessToken();
    const isTokenValid = !!token && token.length > 50;
    console.log("Token validation check:", isTokenValid);
    
    if (!isTokenValid || !isAuthenticated) {
      console.log("Not authenticated, token valid:", isTokenValid, "isAuthenticated:", isAuthenticated);
      setComponentState('not_authenticated');
      return;
    }
    
    const hasAccount = checkForAdAccount();
    if (!hasAccount) {
      console.log("No ad account selected");
      setComponentState('no_ad_account');
      return;
    }
    
    loadStoredAdAccounts();
    
    console.log("All checks passed, component ready");
    setComponentState('ready');
  }, [isAuthenticated, checkForAdAccount, loadStoredAdAccounts]);
  
  useEffect(() => {
    console.log("Messages page mounted");
    
    checkAuth();
    determineComponentState();
    
    const interval = setInterval(() => {
      console.log("Running periodic state check");
      determineComponentState();
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [checkAuth, determineComponentState]);
  
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
    determineComponentState();
  }, [isAuthenticated, determineComponentState]);
  
  const handleConnectClick = () => {
    console.log("Connect button clicked, forcing connection dialog");
    
    localStorage.setItem('show_meta_connection', 'true');
    sessionStorage.setItem('show_meta_connection', 'true');
    
    showConnectionDialog();
    
    setTimeout(() => {
      window.location.href = '/meta-integration?tab=accounts';
    }, 1000);
  };
  
  const handleSelectAdAccount = () => {
    window.location.href = '/meta-integration?tab=accounts';
  };

  return {
    componentState,
    adAccounts,
    isAuthenticated,
    handleConnectClick,
    handleSelectAdAccount
  };
};
