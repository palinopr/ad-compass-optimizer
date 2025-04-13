
import { useEffect, useRef } from 'react';

interface UseMetaConnectionListenersProps {
  checkAuth: () => void;
}

export function useMetaConnectionListeners({ checkAuth }: UseMetaConnectionListenersProps) {
  // Add a ref to prevent multiple simultaneous checks
  const isCheckingRef = useRef(false);
  
  // Function to safely check auth with throttling
  const safeCheckAuth = () => {
    if (isCheckingRef.current) {
      console.log('Auth check already in progress, skipping');
      return;
    }
    
    isCheckingRef.current = true;
    checkAuth();
    
    // Release the lock after a delay
    setTimeout(() => {
      isCheckingRef.current = false;
    }, 1500);
  };
  
  useEffect(() => {
    // Set up interval for periodic auth checks - but with longer interval to prevent excessive refreshes
    const checkInterval = setInterval(() => {
      safeCheckAuth();
    }, 15 * 60 * 1000); // Check every 15 minutes instead of 10
    
    // Add visibility change listener to detect tab focus/return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking auth status...');
        // Add a small delay to prevent immediate check on tab return
        setTimeout(() => safeCheckAuth(), 1000);
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
        setTimeout(() => safeCheckAuth(), 800);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [safeCheckAuth]);
}
