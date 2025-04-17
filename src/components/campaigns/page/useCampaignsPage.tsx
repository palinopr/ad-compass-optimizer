
import { useState, useRef } from 'react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { useTokenValidation } from '@/hooks/campaigns/fetch-hooks/useTokenValidation';
import { useLoadingSafety } from '@/hooks/campaigns/fetch-hooks/useLoadingSafety';
import { useFetchState } from '@/hooks/campaigns/fetch-hooks/useFetchState';
import { useInitialFetch } from '@/hooks/campaigns/fetch-hooks/useInitialFetch';
import { useCampaigns } from '@/hooks/campaigns/useCampaigns';

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

  // Use the useCampaigns hook to get campaign data
  const {
    campaigns,
    filteredCampaigns,
    isLoading,
    error: campaignsError,
    refetchCampaigns,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid,
    forceRender: fallbackForceRender,
  } = useCampaigns(activeTab);

  // Get the current date preset from localStorage or default to 'last_30d'
  const currentDatePreset = localStorage.getItem('last_campaign_fetch_date_preset') || 'last_30d';

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
    isAuthSyncing,
    // Add the missing properties from useCampaigns hook
    campaigns,
    filteredCampaigns,
    campaignsError,
    isLoading,
    selectedAdAccount,
    refetchCampaigns,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid,
    fallbackForceRender,
    currentDatePreset
  };
}
