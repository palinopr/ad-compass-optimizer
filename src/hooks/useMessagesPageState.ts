
import { useState, useEffect, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useToast } from '@/hooks/use-toast';
import { useAdAccountCheck } from './messages/useAdAccountCheck';
import { useFacebookBrowserAuth } from './messages/useFacebookBrowserAuth';
import { useComponentState, ComponentState } from './messages/useComponentState';
import { useNavigation } from './messages/useNavigation';

export interface MessagesPageState {
  componentState: ComponentState;
  adAccounts: any[];
  isAuthenticated: boolean;
}

export const useMessagesPageState = () => {
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { toast } = useToast();
  
  const { checkForAdAccount, loadStoredAdAccounts } = useAdAccountCheck();
  const { 
    componentState, 
    adAccounts, 
    setComponentState, 
    determineComponentState 
  } = useComponentState(isAuthenticated, checkForAdAccount, loadStoredAdAccounts);
  
  const { handleConnectClick, handleSelectAdAccount } = useNavigation();
  
  const checkAuthAndState = useCallback(() => {
    console.log("Force checking auth and state...");
    setComponentState('loading');
    
    checkAuth();
    
    setTimeout(() => {
      determineComponentState();
    }, 300);
  }, [checkAuth, determineComponentState, setComponentState]);
  
  const { handleConnectWithBrowser } = useFacebookBrowserAuth(checkAuth, checkAuthAndState);
  
  // Handle retry connection
  const handleRetryConnection = useCallback(() => {
    toast({
      title: "Retrying connection",
      description: "Checking authentication status..."
    });
    
    checkAuthAndState();
  }, [toast, checkAuthAndState]);
  
  useEffect(() => {
    console.log("Messages page mounted");
    
    checkAuthAndState();
    
    const interval = setInterval(() => {
      console.log("Running periodic state check");
      determineComponentState();
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [checkAuth, determineComponentState, checkAuthAndState]);
  
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
    determineComponentState();
  }, [isAuthenticated, determineComponentState]);

  return {
    componentState,
    adAccounts,
    isAuthenticated,
    handleConnectClick,
    handleSelectAdAccount,
    checkAuthAndState,
    handleConnectWithBrowser,
    handleRetryConnection
  };
};
