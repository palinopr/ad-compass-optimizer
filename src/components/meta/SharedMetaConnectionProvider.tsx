
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

interface MetaConnectionContextType {
  isAuthenticated: boolean;
  userData: any | null;
  hasPermissions: boolean;
  checkAuth: () => void;
  showConnectionDialog: () => void;
}

const MetaConnectionContext = createContext<MetaConnectionContextType>({
  isAuthenticated: false,
  userData: null,
  hasPermissions: false,
  checkAuth: () => {},
  showConnectionDialog: () => {},
});

export const useMetaConnection = () => useContext(MetaConnectionContext);

interface SharedMetaConnectionProviderProps {
  children: React.ReactNode;
}

export const SharedMetaConnectionProvider: React.FC<SharedMetaConnectionProviderProps> = ({ 
  children 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const { toast } = useToast();

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

  // Function to check auth status - can be called from anywhere in the app
  const checkAuth = useCallback(() => {
    const now = Date.now();
    
    // Throttle checks to prevent excessive calls (no more than once per 500ms)
    if (now - lastCheckTime < 500) {
      return;
    }
    
    setLastCheckTime(now);
    console.log('Checking Meta auth status...');
    
    // Get token and check if it exists
    const token = metaAuthService.getAccessToken();
    if (!token) {
      console.log('No token found in storage');
      setIsAuthenticated(false);
      setUserData(null);
      setHasPermissions(false);
      
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
      setIsAuthenticated(true);
      
      // Check for permissions
      const hasAdPermissions = metaAuthService.hasAdAccountPermissions();
      setHasPermissions(hasAdPermissions);
      
      // Try to get user data if available
      const userId = metaAuthService.getUserId();
      if (userId) {
        setUserData({
          id: userId,
          name: localStorage.getItem('meta_user_name') || 'Meta User',
        });
      }
      
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
      setIsAuthenticated(false);
      setUserData(null);
      setHasPermissions(false);
      
      // Clear session storage indicators
      sessionStorage.removeItem('meta_auth_valid');
      sessionStorage.removeItem('meta_auth_checked');
      localStorage.removeItem('meta_auth_valid');
      localStorage.removeItem('meta_auth_checked');
      
      // Clear cookie
      document.cookie = 'meta_auth_valid=; path=/; max-age=0';
    }
  }, [lastCheckTime]);

  // Memorize the auth state for use in useEffect
  const authState = useMemo(() => ({
    isAuthenticated,
    hasPermissions,
    userData
  }), [isAuthenticated, hasPermissions, userData]);
  
  // Check authentication on initial load with improved persistence
  useEffect(() => {
    // Try to restore from localStorage first (for persistence between refreshes)
    const authValidLocal = localStorage.getItem('meta_auth_valid') === 'true';
    const authCheckedLocal = localStorage.getItem('meta_auth_checked');
    
    if (authValidLocal && authCheckedLocal) {
      // If we have auth data in localStorage, immediately restore the state
      console.log('Using auth status from localStorage');
      setIsAuthenticated(true);
      
      // Also set permissions if we had them
      if (metaAuthService.getAccessToken()) {
        setHasPermissions(metaAuthService.hasAdAccountPermissions());
        
        const userId = metaAuthService.getUserId();
        const userName = localStorage.getItem('meta_user_name');
        
        if (userId) {
          setUserData({
            id: userId,
            name: userName || 'Meta User'
          });
        }
      }
    } else {
      // Try from sessionStorage as backup
      const authValid = sessionStorage.getItem('meta_auth_valid') === 'true';
      const authChecked = sessionStorage.getItem('meta_auth_checked');
      
      if (authValid && authChecked) {
        // If we have a recent check in session storage, use it temporarily
        const checkTime = parseInt(authChecked, 10);
        const now = Date.now();
        
        // If the check was recent (less than 60 minutes ago), use the cached status
        if (now - checkTime < 60 * 60 * 1000) {
          console.log('Using cached auth status from session storage');
          setIsAuthenticated(true);
          
          // Also set permissions if we had them
          if (metaAuthService.getAccessToken()) {
            setHasPermissions(metaAuthService.hasAdAccountPermissions());
            
            const userId = metaAuthService.getUserId();
            const userName = localStorage.getItem('meta_user_name');
            
            if (userId) {
              setUserData({
                id: userId,
                name: userName || 'Meta User'
              });
            }
          }
        }
      }
    }
    
    // Always perform a fresh check, but after the potential quick restore
    checkAuth();
    
    // Set up interval for periodic auth checks
    const checkInterval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Add visibility change listener to detect tab focus/return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking auth status...');
        checkAuth();
      }
    };
    
    // Add event listener for visibility change (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add event listener for storage changes (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && (
          event.key === 'meta_access_token' || 
          event.key === 'meta_token_timestamp' ||
          event.key === 'meta_auth_valid' ||
          event.key === 'show_meta_connection' ||
          event.key === 'selected_ad_account' ||
          event.key === 'selected_ad_accounts')) {
        console.log('Storage changed, checking auth status:', event.key);
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  // Report authentication changes
  useEffect(() => {
    // Only report changes, not initial setup
    if (lastCheckTime > 0) {
      if (isAuthenticated) {
        console.log('Authentication state updated: User is authenticated');
        if (!hasPermissions) {
          console.warn('User is authenticated but lacks required permissions');
        }
      } else {
        console.log('Authentication state updated: User is not authenticated');
      }
    }
  }, [isAuthenticated, hasPermissions, lastCheckTime]);

  const value = {
    isAuthenticated,
    userData,
    hasPermissions,
    checkAuth,
    showConnectionDialog
  };

  return (
    <MetaConnectionContext.Provider value={value}>
      {children}
    </MetaConnectionContext.Provider>
  );
};
