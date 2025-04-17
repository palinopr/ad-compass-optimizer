
import React, { useCallback, useRef } from 'react';
import { MetaConnectionState } from '@/hooks/meta/useMetaConnectionState';
import { metaAuthService } from '@/services/MetaAuthService';

interface ConnectionCheckerProviderProps {
  children: React.ReactNode;
  updateAuthState: (newState: Partial<MetaConnectionState>) => void;
}

const ConnectionCheckerProvider: React.FC<ConnectionCheckerProviderProps> = ({
  children,
  updateAuthState
}) => {
  const initialCheckDoneRef = useRef(false);

  // Enhanced checkAuth that validates both token and ad account
  const checkAuth = useCallback(() => {
    console.log('ConnectionCheckerProvider triggering checkAuth');
    
    // Get and validate token
    const token = metaAuthService.getAccessToken();
    const isTokenValid = token && token.length > 50;
    
    // Check for selected ad account
    const selectedAccount = localStorage.getItem('selected_ad_account');
    const hasValidAccount = !!selectedAccount && selectedAccount.length > 0;
    
    if (isTokenValid && hasValidAccount) {
      console.log('Valid token and ad account found, setting auth state to true');
      
      updateAuthState({
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
    } else if (isTokenValid) {
      // We have a token but no account - still authenticate but note the missing account
      console.log('Valid token found but no ad account selected');
      
      updateAuthState({
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
    
    // If no valid token or account, set not authenticated
    updateAuthState({
      isAuthenticated: false,
      userData: null,
      hasPermissions: false,
      lastCheckTime: Date.now()
    });
    
    // Clear stored auth state
    sessionStorage.removeItem('meta_auth_valid');
    sessionStorage.removeItem('meta_auth_checked');
    localStorage.removeItem('meta_auth_valid');
    localStorage.removeItem('meta_auth_checked');
    
    // Clear cookie
    document.cookie = 'meta_auth_valid=; path=/; max-age=0';
  }, [updateAuthState]);

  // Function to trigger showing connection dialog
  const showConnectionDialog = useCallback(() => {
    // Only show connection dialog if user is not already authenticated
    if (!metaAuthService.isAuthenticated()) {
      console.log('Setting flag to show connection dialog on next render');
      localStorage.setItem('show_meta_connection', 'true');
      sessionStorage.setItem('show_meta_connection', 'true');
      
      // Broadcast the event to other tabs for synchronization
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'show_meta_connection',
          newValue: 'true',
          storageArea: localStorage
        }));
      } catch (e) {
        console.error('Error dispatching storage event:', e);
      }
    } else {
      console.log('User is already authenticated, not showing connection dialog');
    }
  }, []);

  return (
    <>{children}</>
  );
};

export { ConnectionCheckerProvider };
export type { ConnectionCheckerProviderProps };
