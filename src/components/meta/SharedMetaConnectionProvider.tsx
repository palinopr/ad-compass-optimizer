
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
  
  // Ref to track if we've reported auth changes to avoid loops
  const reportedRef = useRef(false);
  // Ref to track initial check to prevent multiple checks at startup
  const initialCheckDoneRef = useRef(false);

  // Update local state when hook state changes
  useEffect(() => {
    setState({
      isAuthenticated,
      userData,
      hasPermissions,
      lastCheckTime
    });
    
    // When authentication changes, ensure all components have the latest state
    if (lastCheckTime > 0 && !initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      
      // Broadcast auth change to notify other components
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

  // Report authentication changes - but throttle to prevent loops
  useEffect(() => {
    // Only report changes, not initial setup and prevent loops
    if (lastCheckTime > 0 && !reportedRef.current) {
      reportedRef.current = true;
      
      if (isAuthenticated) {
        console.log('Authentication state updated: User is authenticated');
        if (!hasPermissions) {
          console.warn('User is authenticated but lacks required permissions');
        }
      } else {
        console.log('Authentication state updated: User is not authenticated');
      }
      
      // Reset the reported ref after a delay
      setTimeout(() => {
        reportedRef.current = false;
      }, 3000);
    }
  }, [isAuthenticated, hasPermissions, lastCheckTime]);

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
