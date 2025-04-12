import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

interface MetaConnectionContextType {
  isAuthenticated: boolean;
  userData: any | null;
  hasPermissions: boolean;
  checkAuth: () => void;
}

const MetaConnectionContext = createContext<MetaConnectionContextType>({
  isAuthenticated: false,
  userData: null,
  hasPermissions: false,
  checkAuth: () => {},
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

  // Function to check auth status - can be called from anywhere in the app
  const checkAuth = useCallback(() => {
    const now = Date.now();
    
    // Throttle checks to prevent excessive calls (no more than once per second)
    if (now - lastCheckTime < 1000) {
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
          // Other user data might be added here from storage or API
        });
      }
      
      // Save auth state in sessionStorage AND localStorage for persistence across refreshes
      sessionStorage.setItem('meta_auth_valid', 'true');
      sessionStorage.setItem('meta_auth_checked', now.toString());
      localStorage.setItem('meta_auth_valid', 'true');
      localStorage.setItem('meta_auth_checked', now.toString());
    } else {
      setIsAuthenticated(false);
      setUserData(null);
      setHasPermissions(false);
      
      // Clear session storage indicators
      sessionStorage.removeItem('meta_auth_valid');
      sessionStorage.removeItem('meta_auth_checked');
      localStorage.removeItem('meta_auth_valid');
      localStorage.removeItem('meta_auth_checked');
    }
  }, [lastCheckTime]);

  // Check authentication on initial load
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
        
        // If the check was recent (less than 30 minutes ago), use the cached status
        if (now - checkTime < 30 * 60 * 1000) {
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
  }, [checkAuth]);

  const value = {
    isAuthenticated,
    userData,
    hasPermissions,
    checkAuth
  };

  return (
    <MetaConnectionContext.Provider value={value}>
      {children}
    </MetaConnectionContext.Provider>
  );
};
