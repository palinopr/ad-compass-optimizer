
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MetaConnectionContextType, initialMetaConnectionContext } from './types/metaConnection';
import { useMetaConnectionState, MetaConnectionState } from '@/hooks/meta/useMetaConnectionState';
import { useMetaAuthRestoration } from '@/hooks/meta/useMetaAuthRestoration';
import { useMetaConnectionListeners } from '@/hooks/meta/useMetaConnectionListeners';

const MetaConnectionContext = createContext<MetaConnectionContextType>(initialMetaConnectionContext);

export const useMetaConnection = () => useContext(MetaConnectionContext);

interface SharedMetaConnectionProviderProps {
  children: React.ReactNode;
}

export const SharedMetaConnectionProvider: React.FC<SharedMetaConnectionProviderProps> = ({ 
  children 
}) => {
  // Use our custom hook for state management
  const { 
    isAuthenticated, 
    userData, 
    hasPermissions,
    lastCheckTime,
    checkAuth,
    showConnectionDialog
  } = useMetaConnectionState();

  // Additional state for component-specific needs
  const [state, setState] = useState<MetaConnectionState>({
    isAuthenticated,
    userData,
    hasPermissions,
    lastCheckTime
  });

  // Update local state when hook state changes
  useEffect(() => {
    setState({
      isAuthenticated,
      userData,
      hasPermissions,
      lastCheckTime
    });
  }, [isAuthenticated, userData, hasPermissions, lastCheckTime]);

  // Use our hooks for auth restoration and event listeners
  useMetaAuthRestoration({ checkAuth, setState });
  useMetaConnectionListeners({ checkAuth });

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
