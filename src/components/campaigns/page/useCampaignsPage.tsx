
import { useEffect, useRef } from 'react';
import { useCampaignsPage as useBaseCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';
import { useCampaigns } from '@/hooks/campaigns';
import { metaAuthService } from '@/services/MetaAuthService';
import { DatePresetVerifier } from '@/utils/debugging/DatePresetVerifier';
import { toast } from '@/hooks/use-toast';

export const useCampaignsPage = () => {
  const {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    isAuthSyncing
  } = useBaseCampaignsPage();

  const { 
    campaigns, 
    filteredCampaigns, 
    error: campaignsError, 
    refetchCampaigns, 
    isLoading, 
    fetchCompleted, 
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid
  } = useCampaigns(activeTab);
  
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  const initialFetchTriggeredRef = useRef(false);
  const maxRangeFetchTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('USE_MOCK_MODE');
      localStorage.removeItem('USE_MOCK_META_API');
      localStorage.removeItem('mock_campaigns_data');
      localStorage.removeItem('mock_account_data');
      localStorage.removeItem('FORCE_MOCK_REFRESH');
      
      console.log('[CAMPAIGNS] Ensuring real API data is used, mock mode disabled');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        try {
          DatePresetVerifier.verifyAllDatePresets();
        } catch (e) {
          console.error('[DATE PRESET] Verification error:', e);
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasAdAccount && selectedAdAccount && hasPermissions && !initialFetchTriggeredRef.current) {
      console.log(`[CAMPAIGN FETCH] Full auth validated (token: ${isAuthenticated}, account: ${selectedAdAccount}, permissions: ${hasPermissions}), triggering fetch`);
      
      initialFetchTriggeredRef.current = true;
      
      const token = metaAuthService.getAccessToken();
      console.log('[CAMPAIGN FETCH] Auth state check:', {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        accountSelected: !!selectedAdAccount,
        isAuthenticated, 
        hasAdAccount,
        hasPermissions
      });
      
      setTimeout(() => {
        console.log('[CAMPAIGN FETCH] Initial fetch attempt for account:', selectedAdAccount);
        refetchCampaigns(true);
      }, 500);
    } else {
      console.log('[CAMPAIGN FETCH] Prerequisites not met:', {
        isAuthenticated,
        hasAdAccount,
        selectedAdAccount,
        hasPermissions,
        initialFetchTriggered: initialFetchTriggeredRef.current
      });
    }
  }, [isAuthenticated, hasAdAccount, selectedAdAccount, hasPermissions, refetchCampaigns]);

  // New effect to handle automatic fallback to maximum date range
  useEffect(() => {
    if (fetchCompleted && campaigns && campaigns.length === 0 && !isLoading && !maxRangeFetchTriggeredRef.current) {
      console.log('[CAMPAIGNS] No campaigns found with last_30d, switching to maximum date range');
      
      // Set flag to prevent infinite retry loops
      maxRangeFetchTriggeredRef.current = true;
      
      // Force using maximum date range
      localStorage.setItem('force_maximum_date_preset', 'true');
      
      // Show toast notification to inform user
      toast({
        title: "No data found",
        description: "Switched to maximum date range to find campaigns",
        duration: 5000
      });
      
      // Trigger refetch with maximum date preset
      setTimeout(() => {
        refetchCampaigns(true);
      }, 500);
    }
  }, [fetchCompleted, campaigns, isLoading, refetchCampaigns]);

  useEffect(() => {
    const handleAccountChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.accountId) {
        console.log('[CAMPAIGNS] Ad account changed, triggering campaign refresh');
        initialFetchTriggeredRef.current = false;
        maxRangeFetchTriggeredRef.current = false;
        setTimeout(() => refetchCampaigns(true), 300);
      }
    };
    
    window.addEventListener('ad-account-changed', handleAccountChange as EventListener);
    return () => {
      window.removeEventListener('ad-account-changed', handleAccountChange as EventListener);
    };
  }, [refetchCampaigns]);

  return {
    // Auth state
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    isAuthSyncing,
    
    // Campaign data
    campaigns,
    filteredCampaigns,
    campaignsError,
    isLoading,
    selectedAdAccount,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid,
    
    // UI state
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    
    // Actions
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    refetchCampaigns
  };
};
