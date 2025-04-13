
import { useState, useEffect, useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useAuthCheck } from './useAuthCheck';
import { useAdAccountSelection } from './useAdAccountSelection';
import { useCampaignFetcher } from './useCampaignFetcher';
import { UseCampaignsResult } from './types';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useCampaigns(status?: string): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  const { checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const { fetchCampaignData } = useCampaignFetcher();
  
  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log('Starting campaign fetch process...');
      
      // Step 1: Validate authentication
      const authResult = validateAuthentication();
      if (!authResult.isValid) {
        setError(authResult.error);
        setIsLoading(false);
        return;
      }
      
      // Step 2: Get selected ad account
      const accountResult = getSelectedAdAccount();
      if (!accountResult.hasAccount) {
        setError(accountResult.error);
        setErrorDetails(accountResult.errorDetails);
        setIsLoading(false);
        return;
      }
      
      // Step 3: Fetch campaign data
      const { campaigns: fetchedCampaigns, error: fetchError, errorDetails: fetchErrorDetails } = 
        await fetchCampaignData(authResult.token, accountResult.adAccountId, status);
      
      if (fetchError) {
        setError(fetchError);
        if (fetchErrorDetails) {
          setErrorDetails(fetchErrorDetails);
        }
      } else {
        setCampaigns(fetchedCampaigns);
      }
    } finally {
      setIsLoading(false);
    }
  }, [status, validateAuthentication, getSelectedAdAccount, fetchCampaignData]);
  
  useEffect(() => {
    // Since we're on the messages page but using campaigns component, give a short delay
    // to allow authentication to be checked properly
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);
  
  return {
    campaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: fetchCampaigns
  };
}
