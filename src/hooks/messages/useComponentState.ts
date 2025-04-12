
import { useState, useEffect, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

export type ComponentState = 'loading' | 'not_authenticated' | 'no_ad_account' | 'ready';

export const useComponentState = (
  isAuthenticated: boolean, 
  checkForAdAccount: () => boolean,
  loadStoredAdAccounts: () => any[]
) => {
  const [componentState, setComponentState] = useState<ComponentState>('loading');
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  
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
    
    const accounts = loadStoredAdAccounts();
    setAdAccounts(accounts);
    
    console.log("All checks passed, component ready");
    setComponentState('ready');
  }, [isAuthenticated, checkForAdAccount, loadStoredAdAccounts]);

  return {
    componentState,
    adAccounts,
    setComponentState,
    determineComponentState
  };
};
