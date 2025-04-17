
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MetaConnectionContext } from '../context/MetaConnectionContext';
import { MetaConnectionState, useMetaConnectionState } from '@/hooks/meta/useMetaConnectionState';
import { useMetaAuthRestoration } from '@/hooks/meta/useMetaAuthRestoration';
import { useMetaConnectionListeners } from '@/hooks/meta/useMetaConnectionListeners';
import { metaAuthService } from '@/services/MetaAuthService';

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
    showConnectionDialog: baseShowConnectionDialog
  } = useMetaConnectionState();

  const [state, setState] = useState<MetaConnectionState>({
    isAuthenticated: initialIsAuthenticated,
    userData: initialUserData,
    hasPermissions: initialHasPermissions,
    lastCheckTime
  });
  
  // Ref to prevent multiple initial checks
  const initialCheckDoneRef = useRef(false);
  const authStateChangedRef = useRef(false);

  // Enhanced checkAuth that validates both token and ad account
  const checkAuth = useCallback(() => {
    console.log('SharedMetaConnectionProvider triggering checkAuth');
    
    // Get and validate token
    const token = metaAuthService.getAccessToken();
    const isTokenValid = token && token.length > 50;
    
    // Check for selected ad account
    const selectedAccount = localStorage.getItem('selected_ad_account');
    const hasValidAccount = !!selectedAccount && selectedAccount.length > 0;
    
    // Compare with previous state to detect changes
    const wasAuthenticated = state.isAuthenticated;
    
    if (isTokenValid && hasValidAccount) {
      console.log('Valid token and ad account found, setting auth state to true');
      
      setState(prevState => {
        // Only update if there's a change
        if (!prevState.isAuthenticated) {
          authStateChangedRef.current = true;
          return {
            isAuthenticated: true,
            userData: {
              id: metaAuthService.getUserId() || 'unknown',
              name: localStorage.getItem('meta_user_name') || 'Meta User'
            },
            hasPermissions: true,
            lastCheckTime: Date.now()
          };
        }
        return prevState;
      });
      
      // Store auth state for persistence
      sessionStorage.setItem('meta_auth_valid', 'true');
      sessionStorage.setItem('meta_auth_checked', Date.now().toString());
      localStorage.setItem('meta_auth_valid', 'true');
      localStorage.setItem('meta_auth_checked', Date.now().toString());
      
      // Set cookie for pre-JS load state
      document.cookie = `meta_auth_valid=true; path=/; max-age=3600`;
      
      return;
    } else if (isTokenValid) {
      // We have a token but no account - still authenticate but note the missing account
      console.log('Valid token found but no ad account selected');
      
      setState({
        isAuthenticated: true,
        userData: {
          id: metaAuthService.getUserId() || 'unknown',
          name: localStorage.getItem('meta_user_name') || 'Meta User'
        },
        hasPermissions: true,
        lastCheckTime: Date.now()
      });
      
      return;
    }
    
    // If no valid token or account, fall back to base check
    baseCheckAuth();
  }, [baseCheckAuth, state.isAuthenticated]);

  // Function to show connection dialog
  const showConnectionDialog = useCallback(() => {
    baseShowConnectionDialog();
  }, [baseShowConnectionDialog]);

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
  
  // When auth state changes from false to true, trigger campaign refresh
  useEffect(() => {
    if (authStateChangedRef.current && state.isAuthenticated) {
      console.log('Auth state changed to authenticated, triggering campaign refresh');
      authStateChangedRef.current = false;
      
      setTimeout(() => {
        import('@/hooks/campaigns/fetch-utils/eventHandlers').then((module) => {
          module.triggerCampaignRefresh(true);
        });
      }, 500);
    }
  }, [state.isAuthenticated]);

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

// Re-export the hook for easier imports
export { useMetaConnection } from '../context/MetaConnectionContext';
