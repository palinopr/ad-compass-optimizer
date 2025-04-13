
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Ref to prevent multiple initial checks
  const initialCheckDoneRef = useRef(false);

  // Update local state when hook state changes
  useEffect(() => {
    setState({
      isAuthenticated,
      userData,
      hasPermissions,
      lastCheckTime
    });
    
    if (lastCheckTime > 0 && !initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      console.log('SharedMetaConnectionProvider: Initial auth check complete');
      console.log('Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
      console.log('Has permissions:', hasPermissions ? 'Yes' : 'No');
      
      // Broadcast auth state for cross-component consistency
      try {
        window.dispatchEvent(new CustomEvent('meta-auth-updated', { 
          detail: { isAuthenticated, hasPermissions } 
        }));
      } catch (e) {
        console.error('Error dispatching meta-auth-updated event:', e);
      }
    }
  }, [isAuthenticated, userData, hasPermissions, lastCheckTime]);

  // Use our hooks for auth restoration and event listeners - memoize the checkAuth callback
  const stableCheckAuth = useCallback(() => {
    console.log('SharedMetaConnectionProvider triggering checkAuth');
    checkAuth();
  }, [checkAuth]);
  
  useMetaAuthRestoration({ checkAuth: stableCheckAuth, setState });
  useMetaConnectionListeners({ checkAuth: stableCheckAuth });

  // Run an initial auth check when provider mounts
  useEffect(() => {
    if (!initialCheckDoneRef.current) {
      console.log('SharedMetaConnectionProvider: Running initial auth check');
      stableCheckAuth();
    }
  }, [stableCheckAuth]);

  const value = {
    isAuthenticated,
    userData,
    hasPermissions,
    checkAuth: stableCheckAuth,
    showConnectionDialog
  };

  return (
    <MetaConnectionContext.Provider value={value}>
      {children}
    </MetaConnectionContext.Provider>
  );
};
