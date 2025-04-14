import { useCallback, useEffect, useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from './useAuthCheck';
import { useAdAccountSelection } from './useAdAccountSelection';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFetcher } from './useCampaignFetcher';
import { toast } from '@/hooks/use-toast';
import { UseCampaignsResult } from './types';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';

export function useCampaigns(status?: string): UseCampaignsResult {
  const { checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const { fetchCampaignData } = useCampaignFetcher();
  const [mockInitialized, setMockInitialized] = useState(false);
  
  const isMockMode = useCallback(() => {
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  }, []);
  
  const {
    campaigns, setCampaigns, updateCampaigns,
    isLoading, setIsLoading,
    error, setError,
    errorDetails, setErrorDetails,
    displayRefresh, forceRender, incrementDisplayRefresh,
    clearCampaigns, forceUiRefresh,
    isFetchingRef, lastFetchTimeRef, mountedRef, campaignCountRef
  } = useCampaignFetchState();
  
  useEffect(() => {
    if (isMockMode() && !mockInitialized) {
      console.log('🎭 Mock mode detected in useCampaigns - setting mock campaign data');
      
      let mockCampaigns = [...mockFunnelData.campaigns];
      
      if (status && status !== 'all') {
        mockCampaigns = mockCampaigns.filter(campaign => 
          campaign.status?.toLowerCase() === status.toLowerCase()
        );
      }
      
      updateCampaigns(mockCampaigns);
      setIsLoading(false);
      setMockInitialized(true);
      
      console.log(`🎭 Loaded ${mockCampaigns.length} mock campaigns for status: ${status || 'all'}`);
    }
  }, [isMockMode, mockInitialized, status, updateCampaigns, setIsLoading]);
  
  useEffect(() => {
    if (displayRefresh > 0 && campaigns.length > 0) {
      console.log(`Display refresh triggered (${displayRefresh}), forcing UI update with ${campaigns.length} campaigns`);
    }
  }, [displayRefresh, campaigns.length]);
  
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    if (isMockMode()) {
      if (forceRefresh || !mockInitialized) {
        console.log('🎭 Mock mode: Refreshing mock campaigns');
        
        let mockCampaigns = [...mockFunnelData.campaigns];
        
        if (status && status !== 'all') {
          mockCampaigns = mockCampaigns.filter(campaign => 
            campaign.status?.toLowerCase() === status.toLowerCase()
          );
        }
        
        setIsLoading(true);
        
        setTimeout(() => {
          updateCampaigns(mockCampaigns);
          setIsLoading(false);
          setMockInitialized(true);
          incrementDisplayRefresh();
          
          toast({
            title: "Mock Campaign Data Loaded",
            description: `Loaded ${mockCampaigns.length} simulated campaigns.`,
          });
          
          console.log(`🎭 Loaded ${mockCampaigns.length} mock campaigns for status: ${status || 'all'}`);
        }, 500);
      }
      return;
    }
    
    const now = Date.now();
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping this request');
      return;
    }
    
    if (now - lastFetchTimeRef.current < 5000 && !forceRefresh) {
      console.log('Throttling fetch campaigns request - too soon after last fetch');
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log('Starting campaign fetch process...', { status, forceRefresh });
      
      const token = metaAuthService.getAccessToken();
      
      if (!token || token.length < 50) {
        console.log('No valid token found during campaign fetch');
        setError('Not authenticated with Meta. Please connect your account.');
        setIsLoading(false);
        return;
      }
      
      console.log('Valid token found, proceeding with campaign fetch');
      
      const authResult = validateAuthentication();
      if (!authResult.isValid) {
        setError(authResult.error);
        setIsLoading(false);
        return;
      }
      
      const accountResult = getSelectedAdAccount();
      if (!accountResult.hasAccount) {
        setError(accountResult.error);
        setErrorDetails(accountResult.errorDetails);
        setIsLoading(false);
        return;
      }

      const currentAccountId = accountResult.adAccountId;
      localStorage.setItem('last_fetched_ad_account', currentAccountId);
      
      console.log(`Fetching campaigns for ad account: ${currentAccountId}`);
      
      const { campaigns: fetchedCampaigns, error: fetchError, errorDetails: fetchErrorDetails } = 
        await fetchCampaignData(token, currentAccountId, status);
      
      if (fetchError) {
        console.error('Campaign fetch error:', fetchError, fetchErrorDetails);
        setError(fetchError);
        if (fetchErrorDetails) {
          setErrorDetails(fetchErrorDetails);
        }
      } else {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            if (mountedRef.current) {
              updateCampaigns(fetchedCampaigns);
              
              if (fetchedCampaigns.length > 0) {
                const hadDisplayIssues = localStorage.getItem('had_display_issues') === 'true';
                if (hadDisplayIssues) {
                  toast({
                    title: "Campaign Data Loaded Successfully",
                    description: `Found ${fetchedCampaigns.length} campaigns. Display issues have been fixed.`,
                    variant: "default",
                  });
                  localStorage.removeItem('had_display_issues');
                }
              }
            } else {
              console.warn('Component unmounted before state update could complete');
            }
            resolve();
          }, 300);
        });
      }
    } catch (err: any) {
      console.error('Unexpected error in campaign fetch:', err);
      setError(err?.message || 'An unexpected error occurred while fetching campaigns');
      setErrorDetails({ 
        error: { 
          message: err?.message || 'Unexpected error',
          stack: err?.stack
        } 
      });
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [status, validateAuthentication, getSelectedAdAccount, fetchCampaignData, 
      updateCampaigns, setCampaigns, setError, setErrorDetails, setIsLoading, incrementDisplayRefresh, 
      isFetchingRef, lastFetchTimeRef, mountedRef, isMockMode, mockInitialized]);
  
  useCampaignEventListeners(fetchCampaigns, incrementDisplayRefresh, forceUiRefresh, clearCampaigns, status);
  
  useEffect(() => {
    if (isMockMode()) return;
    
    const checkAdAccountChange = () => {
      const lastFetchedAccount = localStorage.getItem('last_fetched_ad_account');
      const currentAccount = localStorage.getItem('selected_ad_account');
      
      if (lastFetchedAccount && currentAccount && lastFetchedAccount !== currentAccount) {
        console.log('Ad account changed, triggering campaign refresh');
        clearCampaigns();
        fetchCampaigns(true);
      }
    };
    
    checkAdAccountChange();
    const intervalId = setInterval(checkAdAccountChange, 5000);
    
    return () => clearInterval(intervalId);
  }, [clearCampaigns, fetchCampaigns, isMockMode]);
  
  return {
    campaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: fetchCampaigns,
    displayRefresh,
    forceRender
  };
}
