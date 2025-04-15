
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MetaConnectionContextType, initialMetaConnectionContext } from './types/metaConnection';
import { useMetaConnectionState, MetaConnectionState } from '@/hooks/meta/useMetaConnectionState';
import { useMetaAuthRestoration } from '@/hooks/meta/useMetaAuthRestoration';
import { useMetaConnectionListeners } from '@/hooks/meta/useMetaConnectionListeners';
import { metaAuthService } from '@/services/MetaAuthService';

const MetaConnectionContext = createContext<MetaConnectionContextType>(initialMetaConnectionContext);

export const useMetaConnection = () => useContext(MetaConnectionContext);

interface SharedMetaConnectionProviderProps {
  children: React.ReactNode;
}

export const SharedMetaConnectionProvider: React.FC<SharedMetaConnectionProviderProps> = ({ 
  children 
}) => {
  const { 
    isAuthenticated: initialIsAuthenticated, 
    userData: initialUserData, 
    hasPermissions: initialHasPermissions,
    lastCheckTime,
    checkAuth: baseCheckAuth,
    showConnectionDialog
  } = useMetaConnectionState();

  const [state, setState] = useState<MetaConnectionState>({
    isAuthenticated: initialIsAuthenticated,
    userData: initialUserData,
    hasPermissions: initialHasPermissions,
    lastCheckTime
  });
  
  // Ref to prevent multiple initial checks
  const initialCheckDoneRef = useRef(false);

  // Enhanced checkAuth that validates both token and ad account
  const checkAuth = useCallback(() => {
    console.log('SharedMetaConnectionProvider triggering checkAuth');
    
    // Get and validate token
    const token = metaAuthService.getAccessToken();
    const isTokenValid = token && token.length > 50;
    
    // Check for selected ad account
    const selectedAccount = localStorage.getItem('selected_ad_account');
    const hasValidAccount = !!selectedAccount && selectedAccount.length > 0;
    
    if (isTokenValid && hasValidAccount) {
      console.log('Valid token and ad account found, forcing auth state to true');
      setState({
        isAuthenticated: true,
        userData: {
          id: metaAuthService.getUserId() || 'unknown',
          name: localStorage.getItem('meta_user_name') || 'Meta User'
        },
        hasPermissions: true,
        lastCheckTime: Date.now()
      });
      
      // Store auth state for persistence
      sessionStorage.setItem('meta_auth_valid', 'true');
      sessionStorage.setItem('meta_auth_checked', Date.now().toString());
      localStorage.setItem('meta_auth_valid', 'true');
      localStorage.setItem('meta_auth_checked', Date.now().toString());
      
      // Set cookie for pre-JS load state
      document.cookie = `meta_auth_valid=true; path=/; max-age=3600`;
      
      return;
    }
    
    // If no valid token or account, fall back to base check
    baseCheckAuth();
  }, [baseCheckAuth]);

  // Use our hooks for auth restoration and event listeners
  useMetaAuthRestoration({ checkAuth, setState });
  useMetaConnectionListeners({ checkAuth });

  // Run an initial auth check when provider mounts
  useEffect(() => {
    if (!initialCheckDoneRef.current) {
      console.log('SharedMetaConnectionProvider: Running initial auth check');
      checkAuth();
      initialCheckDoneRef.current = true;
    }
  }, [checkAuth]);

  const value = {
    isAuthenticated: state.isAuthenticated,
    userData: state.userData,
    hasPermissions: state.hasPermissions,
    checkAuth,
    showConnectionDialog
  };

  return (
    <MetaConnectionContext.Provider value={value}>
      {children}
    </MetaConnectionContext.Provider>
  );
};
