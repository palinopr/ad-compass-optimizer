
import { useState, useEffect, useCallback, useRef } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useAuthCheck } from './useAuthCheck';
import { useAdAccountSelection } from './useAdAccountSelection';
import { useCampaignFetcher } from './useCampaignFetcher';
import { UseCampaignsResult } from './types';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';

export function useCampaigns(status?: string): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [displayRefresh, setDisplayRefresh] = useState<number>(0);
  
  // Use refs to prevent multiple concurrent fetches
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  
  const { checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const { fetchCampaignData } = useCampaignFetcher();
  
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
      console.log('Starting campaign fetch process...');
      
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
        setError(fetchError);
        if (fetchErrorDetails) {
          setErrorDetails(fetchErrorDetails);
        }
      } else {
        setCampaigns(fetchedCampaigns);
        // Force UI refresh by triggering display refresh counter
        setDisplayRefresh(prev => prev + 1);
        
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
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [status, validateAuthentication, getSelectedAdAccount, fetchCampaignData]);
  
  useEffect(() => {
    // Add delay between initial auth and data fetch to prevent race conditions
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    
    // Add event listener for ad account changes
    const handleAdAccountChange = () => {
      console.log("Ad account changed, refreshing campaigns...");
      // Add a slight delay to let any other UI updates complete
      setTimeout(() => fetchCampaigns(), 100);
    };
    
    // Handle manual refresh requests
    const handleManualRefresh = (e: CustomEvent) => {
      console.log("Manual campaign refresh requested", e.detail);
      // If force refresh is specified, reset the timer to allow immediate fetch
      if (e.detail?.force) {
        lastFetchTimeRef.current = 0;
        fetchCampaigns(true);
      } else {
        fetchCampaigns();
      }
    };
    
    // Handle display refresh requests (new)
    const handleDisplayRefresh = () => {
      console.log("Campaign display refresh requested");
      setDisplayRefresh(prev => prev + 1);
      localStorage.setItem('had_display_issues', 'true');
    };
    
    window.addEventListener('ad-account-changed', handleAdAccountChange);
    window.addEventListener('campaign-data-refresh', handleManualRefresh as EventListener);
    window.addEventListener('campaign-display-refresh', handleDisplayRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('ad-account-changed', handleAdAccountChange);
      window.removeEventListener('campaign-data-refresh', handleManualRefresh as EventListener);
      window.removeEventListener('campaign-display-refresh', handleDisplayRefresh);
    };
  }, [fetchCampaigns]);
  
  return {
    campaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: fetchCampaigns,
    displayRefresh // Add this to help components know when to re-render
  };
}
