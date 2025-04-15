
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from './fetch-utils/eventHandlers';

export function useCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'archived'>('active');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [isAuthSyncing, setIsAuthSyncing] = useState(false);
  const { isAuthenticated, hasPermissions, checkAuth, showConnectionDialog: showContextDialog } = useMetaConnection();
  const initialFetchCompletedRef = useRef(false);
  
  // Direct token check for more reliable auth state
  const token = metaAuthService.getAccessToken();
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  const directIsAuthenticated = !!token && token.length > 50;
  const hasAdAccount = !!selectedAdAccount && selectedAdAccount.length > 0;
  
  // When any auth state changes, trigger a campaign refresh - but only once when everything is ready
  useEffect(() => {
    if (directIsAuthenticated && hasAdAccount && !initialFetchCompletedRef.current) {
      console.log('[CAMPAIGNS PAGE] Auth state validated, triggering initial campaign refresh');
      // Mark as completed to prevent further refreshes from this effect
      initialFetchCompletedRef.current = true;
      
      // Use a slight delay to ensure all auth contexts have settled
      setTimeout(() => {
        triggerCampaignRefresh(true);
      }, 300);
    }
  }, [directIsAuthenticated, hasAdAccount]);

  const handleConnectionSuccess = useCallback(() => {
    setIsAuthSyncing(true);
    setShowConnectionDialog(false);
    
    checkAuth();
    
    setTimeout(() => {
      setIsAuthSyncing(false);
      // Reset the fetch completed flag to allow a new fetch after reconnection
      initialFetchCompletedRef.current = false;
    }, 500);
  }, [checkAuth]);
  
  const handleConnectionError = useCallback((error: any) => {
    console.error('Connection error:', error);
    setShowConnectionDialog(false);
    toast({
      title: "Connection Failed",
      description: error?.message || "Could not connect to your Meta account",
      variant: "destructive"
    });
  }, []);
  
  const refreshConnection = useCallback(() => {
    setIsAuthSyncing(true);
    checkAuth();
    
    setTimeout(() => {
      setIsAuthSyncing(false);
      // Reset the fetch completed flag to allow a new fetch after refresh
      initialFetchCompletedRef.current = false;
    }, 500);
  }, [checkAuth]);
  
  const resetConnection = useCallback(() => {
    metaAuthService.logout();
    localStorage.removeItem('selected_ad_account');
    
    setIsAuthSyncing(true);
    checkAuth();
    
    setTimeout(() => {
      setIsAuthSyncing(false);
      setShowConnectionDialog(true);
      toast({
        title: "Connection Reset",
        description: "Your Meta connection has been reset."
      });
    }, 300);
  }, [checkAuth]);

  return {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated: directIsAuthenticated, // Use direct token check as source of truth
    hasPermissions,
    hasAdAccount,
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    isAuthSyncing
  };
}
