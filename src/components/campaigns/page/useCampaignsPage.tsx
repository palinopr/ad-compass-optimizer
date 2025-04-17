
import { useState, useRef } from 'react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '../fetch-utils/eventHandlers';
import { useTokenValidation } from '@/hooks/campaigns/fetch-hooks/useTokenValidation';
import { useLoadingSafety } from '@/hooks/campaigns/fetch-hooks/useLoadingSafety';
import { useFetchState } from '@/hooks/campaigns/fetch-hooks/useFetchState';
import { useInitialFetch } from '@/hooks/campaigns/fetch-hooks/useInitialFetch';

export function useCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'archived'>('active');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [isAuthSyncing, setIsAuthSyncing] = useState(false);
  
  const { isAuthenticated, hasPermissions, checkAuth, showConnectionDialog: showContextDialog } = useMetaConnection();
  const { validateToken } = useTokenValidation();
  const initialFetchCompletedRef = useRef(false);
  
  // Direct token check for more reliable auth state
  const token = metaAuthService.getAccessToken();
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  const directIsAuthenticated = !!token && token.length > 50;
  const hasAdAccount = !!selectedAdAccount && selectedAdAccount.length > 0;

  const handleConnectionSuccess = () => {
    setIsAuthSyncing(true);
    setShowConnectionDialog(false);
    checkAuth();
    
    setTimeout(() => {
      setIsAuthSyncing(false);
      initialFetchCompletedRef.current = false;
    }, 500);
  };
  
  const handleConnectionError = (error: any) => {
    console.error('Connection error:', error);
    setShowConnectionDialog(false);
    toast({
      title: "Connection Failed",
      description: error?.message || "Could not connect to your Meta account",
      variant: "destructive"
    });
  };
  
  const refreshConnection = () => {
    setIsAuthSyncing(true);
    checkAuth();
    
    setTimeout(() => {
      setIsAuthSyncing(false);
      initialFetchCompletedRef.current = false;
    }, 500);
  };
  
  const resetConnection = () => {
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
  };

  return {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated: directIsAuthenticated,
    hasPermissions,
    hasAdAccount,
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    isAuthSyncing
  };
}
