
import React, { useState, useEffect, useRef } from 'react';
import { MetaConnectionState } from '@/hooks/meta/useMetaConnectionState';
import { metaAuthService } from '@/services/MetaAuthService';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

interface AuthStateProviderProps {
  initialState: MetaConnectionState;
  children: React.ReactNode;
  onStateChange?: (newState: MetaConnectionState) => void;
}

const AuthStateProvider: React.FC<AuthStateProviderProps> = ({
  initialState,
  children,
  onStateChange
}) => {
  const [state, setState] = useState<MetaConnectionState>(initialState);
  const authStateChangedRef = useRef(false);

  // Effect to handle auth state changes
  useEffect(() => {
    if (authStateChangedRef.current && state.isAuthenticated) {
      console.log('Auth state changed to authenticated, triggering campaign refresh');
      authStateChangedRef.current = false;
      
      setTimeout(() => {
        triggerCampaignRefresh(true);
      }, 500);
    }
  }, [state.isAuthenticated]);

  // Function to update auth state with side effects
  const updateAuthState = (newPartialState: Partial<MetaConnectionState>) => {
    const wasAuthenticated = state.isAuthenticated;
    
    setState(prevState => {
      const newState = { ...prevState, ...newPartialState };
      
      // If authentication state changed from false to true, mark for campaign refresh
      if (!wasAuthenticated && newState.isAuthenticated) {
        authStateChangedRef.current = true;
      }
      
      // Call the onStateChange callback if provided
      if (onStateChange) {
        onStateChange(newState);
      }
      
      return newState;
    });
  };

  return (
    <>{children}</>
  );
};

export { AuthStateProvider };
export type { AuthStateProviderProps };
