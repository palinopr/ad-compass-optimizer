
import { useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaConnectionState } from './useMetaConnectionState';

interface UseMetaAuthRestorationProps {
  checkAuth: () => void;
  setState: React.Dispatch<React.SetStateAction<MetaConnectionState>>;
}

export function useMetaAuthRestoration({ checkAuth, setState }: UseMetaAuthRestorationProps) {
  // Check authentication on initial load with improved persistence
  useEffect(() => {
    // Try to restore from localStorage first (for persistence between refreshes)
    const authValidLocal = localStorage.getItem('meta_auth_valid') === 'true';
    const authCheckedLocal = localStorage.getItem('meta_auth_checked');
    
    if (authValidLocal && authCheckedLocal) {
      // If we have auth data in localStorage, immediately restore the state
      console.log('Using auth status from localStorage');
      
      // Also set permissions if we had them
      if (metaAuthService.getAccessToken()) {
        const hasPermissions = metaAuthService.hasAdAccountPermissions();
        
        const userId = metaAuthService.getUserId();
        const userName = localStorage.getItem('meta_user_name');
        
        const userData = userId ? {
          id: userId,
          name: userName || 'Meta User'
        } : null;
        
        setState(prev => ({
          ...prev, 
          isAuthenticated: true,
          hasPermissions,
          userData
        }));
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
          
          // Also set permissions if we had them
          if (metaAuthService.getAccessToken()) {
            const hasPermissions = metaAuthService.hasAdAccountPermissions();
            
            const userId = metaAuthService.getUserId();
            const userName = localStorage.getItem('meta_user_name');
            
            const userData = userId ? {
              id: userId,
              name: userName || 'Meta User'
            } : null;
            
            setState(prev => ({
              ...prev, 
              isAuthenticated: true,
              hasPermissions,
              userData
            }));
          }
        }
      }
    }
    
    // Always perform a fresh check, but after the potential quick restore
    checkAuth();
  }, [checkAuth, setState]);
}
