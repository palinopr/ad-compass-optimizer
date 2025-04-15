
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
  } = useCampaigns(status);
  
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = useCampaignFilters(campaigns);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;

  // Reset filters when ad account changes
  useEffect(() => {
    const handleAccountChange = () => {
      // Reset all filters to default values
      setDateRange(null, 'last30days');
      setStatusFilter(null);
      setSearchQuery('');
    };

    window.addEventListener('ad-account-changed', handleAccountChange);
    return () => {
      window.removeEventListener('ad-account-changed', handleAccountChange);
    };
  }, [setDateRange, setStatusFilter, setSearchQuery]);

  useEffect(() => {
    if (campaigns.length === 0 && !isLoading) {
      setStatusMessage("No campaigns exist in this ad account.");
    } else {
      setStatusMessage(null);
    }
  }, [campaigns, isLoading]);

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
    statusMessage,
    setStatusMessage
  };
};
