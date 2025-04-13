
import { useEffect } from 'react';

interface UseMetaConnectionListenersProps {
  checkAuth: () => void;
}

export function useMetaConnectionListeners({ checkAuth }: UseMetaConnectionListenersProps) {
  useEffect(() => {
    // Set up interval for periodic auth checks - but with longer interval to prevent excessive refreshes
    const checkInterval = setInterval(() => {
      checkAuth();
    }, 10 * 60 * 1000); // Check every 10 minutes instead of 5
    
    // Add visibility change listener to detect tab focus/return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking auth status...');
        // Add a small delay to prevent immediate check on tab return
        setTimeout(() => checkAuth(), 500);
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
        // Add small delay to prevent race conditions
        setTimeout(() => checkAuth(), 300);
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
