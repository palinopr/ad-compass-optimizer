
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck';
import { MetaApiService } from '@/services/MetaApiService';

export function useCampaignsPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [isAuthSyncing, setIsAuthSyncing] = useState(false);
  const { isAuthenticated, hasPermissions, userData, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const { toast } = useToast();
  
  // Add a ref to prevent excessive syncs
  const syncInProgressRef = useRef(false);
  // Ref to track initial auth check
  const initialSyncDoneRef = useRef(false);
  
  // Force synchronize authentication state on mount and when component becomes visible
  const syncAuthState = useCallback(async () => {
    // Prevent multiple simultaneous auth checks
    if (isAuthSyncing || syncInProgressRef.current) return;
    
    syncInProgressRef.current = true;
    setIsAuthSyncing(true);
    console.log('Synchronizing authentication state...');
    
    try {
      // Force check auth status
      await checkAuth();
      
      // Validate auth through MetaApiService for direct API check
      const token = metaAuthService.getAccessToken();
      if (token) {
        console.log('Testing API connection with current token');
        const connectionTest = await MetaApiService.testConnection(token);
        
        if (connectionTest.success) {
          console.log('API connection test successful');
        } else {
          console.warn('API connection test failed, but token exists:', connectionTest.error);
          // Don't invalidate the token here, as it might work for some API endpoints
        }
      }
    } catch (error) {
      console.error('Error synchronizing auth state:', error);
    } finally {
      setIsAuthSyncing(false);
      // Add a delay before allowing another sync
      setTimeout(() => {
        syncInProgressRef.current = false;
      }, 3000);
    }
  }, [checkAuth, isAuthSyncing]);
  
  useEffect(() => {
    // Perform initial sync only once with delay to prevent racing with other checks
    if (!initialSyncDoneRef.current) {
      initialSyncDoneRef.current = true;
      const initialSyncTimeout = setTimeout(() => {
        syncAuthState();
      }, 800);
      
      return () => clearTimeout(initialSyncTimeout);
    }
  }, [syncAuthState]);
  
  useEffect(() => {
    // Listen for auth updates from SharedMetaConnectionProvider
    const handleMetaAuthUpdated = (event: CustomEvent<any>) => {
      console.log('Received meta-auth-updated event:', event.detail);
      // No need to do additional check here as the event itself indicates 
      // the auth state was already updated
    };
    
    // Check if we should show the connection dialog (set by the ErrorState component)
    const shouldShowConnection = localStorage.getItem('show_meta_connection') === 'true';
    if (shouldShowConnection) {
      console.log('Showing Meta connection dialog due to stored flag');
      setShowConnectionDialog(true);
      localStorage.removeItem('show_meta_connection');
    }
    
    // Add event listener
    window.addEventListener('meta-auth-updated', handleMetaAuthUpdated as EventListener);
    
    return () => {
      window.removeEventListener('meta-auth-updated', handleMetaAuthUpdated as EventListener);
    };
  }, []);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    const directAdAccount = localStorage.getItem('selected_ad_account');
    
    return (selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0) || !!directAdAccount;
  };
  
  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful, user data:', userData);
    // Add delay before sync to prevent race conditions
    setTimeout(() => {
      syncAuthState(); // Fully sync auth state after successful connection
    }, 1000);
    
    setShowConnectionDialog(false);
    
    toast({
      title: "Connected Successfully",
      description: "Your Meta account is now connected."
    });
  };
  
  const handleConnectionError = () => {
    // Just close the dialog but don't update auth state
    setShowConnectionDialog(false);
  };
  
  const refreshConnection = () => {
    console.log('Refreshing Meta connection');
    syncAuthState();
    
    toast({
      title: "Refreshing Connection",
      description: "Checking your Meta connection status..."
    });
  };
  
  const resetConnection = () => {
    console.log('Resetting Meta connection');
    // Clear all Meta-related data
    metaAuthService.logout();
    localStorage.removeItem('show_meta_connection');
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    
    // Force auth check after clearing - add delay to ensure cleanup is complete
    setTimeout(() => {
      syncAuthState();
      // Show connection dialog
      setShowConnectionDialog(true);
    }, 500);
    
    toast({
      title: "Connection Reset",
      description: "Meta connection has been reset. Please reconnect."
    });
  };

  return {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated,
    hasPermissions,
    hasAdAccount: hasAdAccount(),
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    isAuthSyncing
  };
}
