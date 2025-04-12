
import { useState, useEffect, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

export interface MetaConnectionState {
  isAuthenticated: boolean;
  userData: any | null;
  hasPermissions: boolean;
  lastCheckTime: number;
}

export function useMetaConnectionState() {
  const [state, setState] = useState<MetaConnectionState>({
    isAuthenticated: false,
    userData: null,
    hasPermissions: false,
    lastCheckTime: 0,
  });

  const checkAuth = useCallback(() => {
    const now = Date.now();
    
    // Throttle checks to prevent excessive calls (no more than once per 500ms)
    if (now - state.lastCheckTime < 500) {
      return;
    }
    
    console.log('Checking Meta auth status...');
    
    // Get token and check if it exists
    const token = metaAuthService.getAccessToken();
    if (!token) {
      console.log('No token found in storage');
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        userData: null,
        hasPermissions: false,
        lastCheckTime: now
      }));
      
      // Clear session storage indicators
      sessionStorage.removeItem('meta_auth_valid');
      sessionStorage.removeItem('meta_auth_checked');
      localStorage.removeItem('meta_auth_valid');
      localStorage.removeItem('meta_auth_checked');
      return;
    }
    
    // Check if the token is valid
    const isValid = metaAuthService.isAuthenticated();
    console.log('Authentication check result:', isValid);
    
    if (isValid) {
      // Check for permissions
      const hasAdPermissions = metaAuthService.hasAdAccountPermissions();
      
      // Try to get user data if available
      const userId = metaAuthService.getUserId();
      const userData = userId ? {
        id: userId,
        name: localStorage.getItem('meta_user_name') || 'Meta User',
      } : null;
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        hasPermissions: hasAdPermissions,
        userData,
        lastCheckTime: now
      }));
      
      // Save auth state in sessionStorage AND localStorage for persistence across refreshes
      sessionStorage.setItem('meta_auth_valid', 'true');
      sessionStorage.setItem('meta_auth_checked', now.toString());
      localStorage.setItem('meta_auth_valid', 'true');
      localStorage.setItem('meta_auth_checked', now.toString());
      
      // Also cache a flag that can be read before JS loads on page refresh
      document.cookie = `meta_auth_valid=true; path=/; max-age=3600`;
      
      console.log('Authentication successful, permissions status:', hasAdPermissions);
    } else {
      console.log('Authentication check failed, clearing state');
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        userData: null,
        hasPermissions: false,
        lastCheckTime: now
      }));
      
      // Clear session storage indicators
      sessionStorage.removeItem('meta_auth_valid');
      sessionStorage.removeItem('meta_auth_checked');
      localStorage.removeItem('meta_auth_valid');
      localStorage.removeItem('meta_auth_checked');
      
      // Clear cookie
      document.cookie = 'meta_auth_valid=; path=/; max-age=0';
    }
  }, [state.lastCheckTime]);

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

  return {
    ...state,
    checkAuth,
    showConnectionDialog
  };
}
