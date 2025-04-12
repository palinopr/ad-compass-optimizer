
import { useEffect } from 'react';

interface UseMetaConnectionListenersProps {
  checkAuth: () => void;
}

export function useMetaConnectionListeners({ checkAuth }: UseMetaConnectionListenersProps) {
  useEffect(() => {
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
}
