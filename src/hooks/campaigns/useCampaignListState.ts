
import { useRef, useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import { useCampaignFilters } from './useCampaignFilters';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useAuthCheck } from './useAuthCheck';
import { metaAuthService } from '@/services/MetaAuthService';

export const useCampaignListState = (status: 'active' | 'draft' | 'archived') => {
  const { campaigns, isLoading, error, refetchCampaigns, errorDetails, displayRefresh, forceRender } = useCampaigns(status);
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = useCampaignFilters(campaigns);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const campaignsRef = useRef<typeof campaigns>([]);
  const renderCountRef = useRef(0);
  const [localRenderKey, setLocalRenderKey] = useState(0);

  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[MOCK DEBUG] CampaignList (${status}): Render #${renderCountRef.current}`, { 
      campaignsLength: campaigns.length,
      filteredLength: filteredCampaigns.length,
      campaignsChanged: campaigns !== campaignsRef.current,
      displayRefresh,
      forceRender,
      localRenderKey,
      mockMode: localStorage.getItem("USE_MOCK_MODE") === "true"
    });
    
    campaignsRef.current = campaigns;
    
    if (campaigns.length > 0) {
      console.log(`[MOCK DEBUG] CampaignList has ${campaigns.length} campaigns, updating localRenderKey`);
      setLocalRenderKey(prev => prev + 1);
    }
  }, [campaigns, filteredCampaigns.length, status, displayRefresh, forceRender]);

  useEffect(() => {
    const handleAdAccountChange = () => {
      console.log('[MOCK DEBUG] Ad account changed, forcing UI refresh in CampaignList');
      setLocalRenderKey(prev => prev + 1);
    };
    
    window.addEventListener('ad-account-changed', handleAdAccountChange);
    return () => {
      window.removeEventListener('ad-account-changed', handleAdAccountChange);
    };
  }, []);

  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    console.log(`[MOCK DEBUG] CampaignList (${status}): Direct auth check:`, 
      directAuthCheck ? 'Valid token found' : 'No valid token',
      'Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    
    if (directAuthCheck !== isAuthenticated) {
      console.log('[MOCK DEBUG] Authentication state mismatch detected in CampaignList, refreshing...');
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, status]);

  // Add a forced initial fetch for mock mode
  useEffect(() => {
    const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
    
    if (isMockMode && campaigns.length === 0) {
      console.log(`[MOCK DEBUG] CampaignList (${status}): Initial mock mode load, forcing fetch`);
      // Use immediate timeout to ensure other hooks have initialized
      const timer = setTimeout(() => {
        refetchCampaigns(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [campaigns.length, refetchCampaigns, status]);

  return {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    effectiveIsAuthenticated,
    filters,
    setDateRange,
    setStatusFilter,
    setSearchQuery,
    refetchCampaigns,
    localRenderKey
  };
};
