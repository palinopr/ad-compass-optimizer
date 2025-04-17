
import { useEffect, useRef, useState } from 'react';
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

  // Add state to track UI resets due to fallback
  const [fallbackForceRender, setFallbackForceRender] = useState(0);
  const [currentDatePreset, setCurrentDatePreset] = useState<string>('last_30d');

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
  const fallbackFetchTriggeredRef = useRef(false);

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

    // Add listener for date preset fallback event with improved handling
    const handleDatePresetFallback = (event: Event) => {
      const customEvent = event as CustomEvent;
      const reason = customEvent.detail?.reason || 'Unknown reason';
      const shouldRefresh = customEvent.detail?.shouldRefresh || false;
      
      console.log(`[CAMPAIGNS] Date preset fallback triggered: ${reason}, shouldRefresh: ${shouldRefresh}`);
      
      // Always force UI re-render when fallback happens
      setFallbackForceRender(prev => prev + 1);
      
      // Set current date preset to maximum for display
      setCurrentDatePreset('maximum');
      
      // Avoid duplicate fallback events
      if (fallbackFetchTriggeredRef.current && !shouldRefresh) {
        console.log('[CAMPAIGNS] Ignoring duplicate fallback event');
        return;
      }

      fallbackFetchTriggeredRef.current = true;
      toast({
        title: "Using fallback date range",
        description: "Switched to maximum date range automatically. No data found for Last 30 Days.",
        duration: 5000
      });
      
      // Wait a moment before triggering refetch
      setTimeout(() => {
        console.log('[CAMPAIGNS] Executing fallback fetch with maximum date range');
        refetchCampaigns(true);
      }, 500);
    };

    window.addEventListener('date-preset-fallback-triggered', handleDatePresetFallback);
    
    return () => {
      window.removeEventListener('date-preset-fallback-triggered', handleDatePresetFallback);
    };
  }, [refetchCampaigns]);

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

  // Effect to handle automatic fallback to maximum date range
  useEffect(() => {
    if (fetchCompleted && campaigns && campaigns.length === 0 && !isLoading && !maxRangeFetchTriggeredRef.current) {
      console.log('[CAMPAIGNS] No campaigns found with last_30d, switching to maximum date range');
      
      // Set flag to prevent infinite retry loops
      maxRangeFetchTriggeredRef.current = true;
      
      // Force using maximum date range
      localStorage.setItem('force_maximum_date_preset', 'true');
      localStorage.setItem('date_preset_fallback_reason', 'No campaigns found with last_30d');
      
      // Update current date preset for UI display
      setCurrentDatePreset('maximum');
      
      // Force UI re-render
      setFallbackForceRender(prev => prev + 1);
      
      console.log('👉 Switched to fallback date preset: maximum');
      
      // Show toast notification to inform user
      toast({
        title: "Using fallback date range",
        description: "Switched to maximum date range. No data found for Last 30 Days.",
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
        fallbackFetchTriggeredRef.current = false;
        
        // Clear fallback flags when account changes
        localStorage.removeItem('force_maximum_date_preset');
        localStorage.removeItem('fallback_notified');
        localStorage.removeItem('date_preset_fallback_reason');
        
        // Reset date preset to default
        setCurrentDatePreset('last_30d');
        
        // Force UI re-render
        setFallbackForceRender(prev => prev + 1);
        
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
    fallbackForceRender,
    currentDatePreset,
    
    // Actions
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    refetchCampaigns
  };
};
