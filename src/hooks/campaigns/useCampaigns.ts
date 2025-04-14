
import { useCallback, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from './useAuthCheck';
import { useAdAccountSelection } from './useAdAccountSelection';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFetcher } from './useCampaignFetcher';
import { toast } from '@/hooks/use-toast';
import { UseCampaignsResult } from './types';

export function useCampaigns(status?: string): UseCampaignsResult {
  const { checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const { fetchCampaignData } = useCampaignFetcher();
  
  // Use the enhanced hook for state management
  const {
    campaigns, setCampaigns,
    isLoading, setIsLoading,
    error, setError,
    errorDetails, setErrorDetails,
    displayRefresh, incrementDisplayRefresh,
    clearCampaigns, forceUiRefresh,
    isFetchingRef, lastFetchTimeRef, mountedRef, campaignCountRef
  } = useCampaignFetchState();
  
  // Force a UI refresh when displayRefresh changes
  useEffect(() => {
    if (displayRefresh > 0 && campaigns.length > 0) {
      console.log(`Display refresh triggered (${displayRefresh}), forcing UI update with ${campaigns.length} campaigns`);
    }
  }, [displayRefresh, campaigns.length]);
  
  // Function to fetch campaigns with enhanced display refresh
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent fetches and limit frequency to once every 5 seconds
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
      
      // Step 1: Always check token directly as the source of truth
      const token = metaAuthService.getAccessToken();
      
      if (!token || token.length < 50) {
        console.log('No valid token found during campaign fetch');
        setError('Not authenticated with Meta. Please connect your account.');
        setIsLoading(false);
        return;
      }
      
      console.log('Valid token found, proceeding with campaign fetch');
      
      // Step 2: Validate authentication using the consolidated method
      const authResult = validateAuthentication();
      if (!authResult.isValid) {
        setError(authResult.error);
        setIsLoading(false);
        return;
      }
      
      // Step 3: Get selected ad account
      const accountResult = getSelectedAdAccount();
      if (!accountResult.hasAccount) {
        setError(accountResult.error);
        setErrorDetails(accountResult.errorDetails);
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching campaigns for ad account: ${accountResult.adAccountId}`);
      
      // Step 4: Fetch campaign data
      const { campaigns: fetchedCampaigns, error: fetchError, errorDetails: fetchErrorDetails } = 
        await fetchCampaignData(token, accountResult.adAccountId, status);
      
      if (fetchError) {
        console.error('Campaign fetch error:', fetchError, fetchErrorDetails);
        setError(fetchError);
        if (fetchErrorDetails) {
          setErrorDetails(fetchErrorDetails);
        }
      } else {
        console.log(`Successfully fetched ${fetchedCampaigns.length} campaigns`, {
          status,
          firstCampaign: fetchedCampaigns[0] ? fetchedCampaigns[0].id : 'none',
          mounted: mountedRef.current
        });
        
        // Save to localStorage for troubleshooting
        localStorage.setItem('last_campaign_count', fetchedCampaigns.length.toString());
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_list_status', status || 'all');
        localStorage.setItem('last_empty_result', fetchedCampaigns.length === 0 ? 'true' : 'false');
        
        // Update state only if the component is still mounted
        if (mountedRef.current) {
          // First set campaigns
          setCampaigns(fetchedCampaigns);
          
          // Force UI refresh by triggering display refresh counter
          incrementDisplayRefresh();
          
          // If we have campaigns but previously had display issues, show success toast
          const hadDisplayIssues = localStorage.getItem('had_display_issues') === 'true';
          if (fetchedCampaigns.length > 0 && hadDisplayIssues) {
            toast({
              title: "Campaign Data Loaded Successfully",
              description: `Found ${fetchedCampaigns.length} campaigns. Display issues have been fixed.`,
              variant: "default",
            });
            localStorage.removeItem('had_display_issues');
          }
        } else {
          console.warn('Component unmounted before state update could complete');
        }
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
      setCampaigns, setError, setErrorDetails, setIsLoading, incrementDisplayRefresh, 
      isFetchingRef, lastFetchTimeRef, mountedRef]);
  
  // Use the enhanced hook for event listeners
  useCampaignEventListeners(fetchCampaigns, incrementDisplayRefresh, forceUiRefresh, clearCampaigns, status);
  
  return {
    campaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: fetchCampaigns,
    displayRefresh
  };
}
