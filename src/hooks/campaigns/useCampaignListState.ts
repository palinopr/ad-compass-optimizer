
import { useRef, useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import { useCampaignFilters } from './useCampaignFilters';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useAuthCheck } from './useAuthCheck';
import { metaAuthService } from '@/services/MetaAuthService';

export const useCampaignListState = (status: 'active' | 'draft' | 'archived') => {
  const { 
    campaigns, 
    isLoading, 
    error, 
    refetchCampaigns, 
    errorDetails, 
    displayRefresh, 
    forceRender,
    fetchCompleted
  } = useCampaigns(status);
  
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = useCampaignFilters(campaigns);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;
  const initialFetchAttemptedRef = useRef(false);
  
  // Direct token check to be absolutely sure
  const token = metaAuthService.getAccessToken();
  const selectedAdAccountId = localStorage.getItem('selected_ad_account');
  const directAuthCheck = !!token && token.length > 50 && !!selectedAdAccountId;
  
  // Enhanced logging for campaigns tab connection state
  useEffect(() => {
    const tokenLength = token ? token.length : 0;
    
    console.log('[CAMPAIGNS TAB] Meta connection status:', {
      isAuthenticated: effectiveIsAuthenticated,
      directAuthCheck,
      hasToken: !!token,
      tokenLength: tokenLength,
      selectedAdAccountId,
      authValid: authResult.isValid,
      authError: authResult.error || 'No error',
      fetchCompleted
    });
    
    // Only trigger a fetch on first load if valid auth is detected AND hasn't been attempted yet
    if (directAuthCheck && !initialFetchAttemptedRef.current && !isLoading) {
      console.log('[CAMPAIGNS TAB] First load with valid auth detected, triggering fetch');
      initialFetchAttemptedRef.current = true;
      
      setTimeout(() => {
        refetchCampaigns(true);
      }, 300);
    }
    
    if (token && selectedAdAccountId) {
      console.log('[CAMPAIGNS TAB] Fetch would be triggered with:', {
        tokenLength: tokenLength,
        adAccountId: selectedAdAccountId,
        endpoint: `/act_${selectedAdAccountId}/campaigns`
      });
    } else {
      console.log('[CAMPAIGNS TAB] Missing required fetch parameters:', {
        hasToken: !!token,
        hasAdAccountId: !!selectedAdAccountId
      });
    }
  }, [effectiveIsAuthenticated, authResult, directAuthCheck, token, selectedAdAccountId, refetchCampaigns, isLoading]);

  // Reset filters when ad account changes
  useEffect(() => {
    const handleAccountChange = () => {
      // Reset all filters to default values but use Meta API compatible presets
      setDateRange(null, 'last_28d');
      setStatusFilter(null);
      setSearchQuery('');
      // Reset the fetch attempted flag when account changes
      initialFetchAttemptedRef.current = false;
    };

    window.addEventListener('ad-account-changed', handleAccountChange);
    return () => {
      window.removeEventListener('ad-account-changed', handleAccountChange);
    };
  }, [setDateRange, setStatusFilter, setSearchQuery]);

  // Update status message only when fetch is completed
  useEffect(() => {
    if (fetchCompleted && campaigns.length === 0 && !isLoading) {
      setStatusMessage("No campaigns exist in this ad account.");
    } else {
      setStatusMessage(null);
    }
  }, [campaigns, isLoading, fetchCompleted]);

  return {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    effectiveIsAuthenticated: directAuthCheck, // Use the direct token check as most reliable
    filters,
    setDateRange,
    setStatusFilter,
    setSearchQuery,
    refetchCampaigns,
    statusMessage,
    setStatusMessage,
    fetchCompleted
  };
};
