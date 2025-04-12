
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { metaAuthService, MetaAuthService } from '@/services/MetaAuthService';

interface MetaConnectionContextType {
  isAuthenticated: boolean;
  hasPermissions: boolean;
  checkAuth: () => void;
}

const MetaConnectionContext = createContext<MetaConnectionContextType>({
  isAuthenticated: false,
  hasPermissions: false,
  checkAuth: () => {}
});

export const useMetaConnection = () => useContext(MetaConnectionContext);

interface SharedMetaConnectionProviderProps {
  children: ReactNode;
}

export const SharedMetaConnectionProvider: React.FC<SharedMetaConnectionProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  const checkAuth = () => {
    console.log('Checking Meta auth status...');
    const authenticated = metaAuthService.isAuthenticated();
    console.log('Authentication check result:', authenticated);
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const permissions = metaAuthService.getPermissions();
      console.log('Meta permissions:', permissions);
      const hasAdPermission = permissions.some(p => 
        p === 'ads_management' || p === 'ads_read'
      );
      setHasPermissions(hasAdPermission);
    } else {
      setHasPermissions(false);
    }
  };

  useEffect(() => {
    // Check auth status when the component mounts
    checkAuth();
    
    // Set up a periodic check to ensure auth state is maintained
    const intervalId = setInterval(() => {
      checkAuth();
    }, 30000); // Check every 30 seconds
    
    // Set up storage event listener to catch changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === MetaAuthService.TOKEN_KEY || 
        event.key === MetaAuthService.PERMISSIONS_KEY ||
        event.key === null // null means clear all storage
      ) {
        console.log('Meta auth storage changed, updating state');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <MetaConnectionContext.Provider value={{ isAuthenticated, hasPermissions, checkAuth }}>
      {children}
    </MetaConnectionContext.Provider>
  );
};
