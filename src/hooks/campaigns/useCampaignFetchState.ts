
import { useRef, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { fetchInsightsForCampaigns } from './fetch-utils/campaignInsightsFetcher';
import { metaAuthService } from '@/services/MetaAuthService';

interface FetchMetadata {
  status?: number;
  success: boolean;
  campaignCount: number;
  fetchedAt: string;
  source: 'Live Meta API' | 'Mock Data';
}

/**
 * Hook for managing campaign fetch state with improved UI refresh capabilities
 */
export function useCampaignFetchState() {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [displayRefresh, setDisplayRefresh] = useState<number>(0);
  const [forceRender, setForceRender] = useState<number>(0); // State for forcing renders
  
  // Use refs to prevent multiple concurrent fetches
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const campaignCountRef = useRef<number>(0);
  const lastUpdateSourceRef = useRef<string>('init');
  const [lastFetchMetadata, setLastFetchMetadata] = useState<FetchMetadata | null>(null);
  // Add a sentinelRef to track if we've ever had campaigns (prevents stuck loading state)
  const hasEverHadCampaignsRef = useRef<boolean>(false);

  // Set mounted flag on component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    console.log('useCampaignFetchState mounted');
    return () => {
      console.log('useCampaignFetchState unmounted');
      mountedRef.current = false;
    };
  }, []);

  // Update campaign count ref whenever campaigns change
  useEffect(() => {
    const prevCount = campaignCountRef.current;
    campaignCountRef.current = campaigns.length;
    
    console.log(`[CAMPAIGN STATE] Campaign count updated: ${prevCount} -> ${campaigns.length}`);
    
    // Update fetch metadata when campaigns change
    if (campaigns.length !== prevCount) {
      updateFetchMetadata({
        success: true,
        campaignCount: campaigns.length,
        status: 200,
      });
      
      if (campaigns.length > 0) {
        // Mark that we've received campaigns at least once
        hasEverHadCampaignsRef.current = true;
        
        // If we were in loading state and received campaigns, exit loading state
        if (isLoading) {
          console.log('[CAMPAIGN STATE] Received campaigns, exiting loading state');
          setIsLoading(false);
        }
      }
    }
  }, [campaigns, isLoading]);

  // Check for stuck loading state
  useEffect(() => {
    if (isLoading && !isFetchingRef.current && hasEverHadCampaignsRef.current) {
      // If we're in loading state but not fetching and have had campaigns before
      console.log('[CAMPAIGN STATE] Detected stuck loading state, forcing exit');
      setIsLoading(false);
    }
  }, [isLoading]);

  const incrementDisplayRefresh = () => {
    setDisplayRefresh(prev => {
      const newValue = prev + 1;
      console.log(`Incrementing display refresh counter: ${prev} -> ${newValue}`);
      return newValue;
    });
  };

  // Function to clear campaigns state (useful when switching accounts)
  const clearCampaigns = () => {
    console.log('[MOCK DEBUG] Clearing campaign state');
    lastUpdateSourceRef.current = 'clearCampaigns';
    setCampaigns([]);
    campaignCountRef.current = 0;
    // Also increment force render to ensure UI updates
    setForceRender(prev => prev + 1);
  };

  // Enhanced function to force a UI refresh
  const forceUiRefresh = () => {
    console.log('[MOCK DEBUG] Forcing UI refresh');
    lastUpdateSourceRef.current = 'forceUiRefresh';
    incrementDisplayRefresh();
    setForceRender(prev => prev + 1);
    // Trigger React to re-render by cloning the campaigns array
    if (campaigns.length > 0) {
      console.log('[MOCK DEBUG] Cloning campaigns array to force update');
      setCampaigns([...campaigns]);
    }
  };

  // Direct setCampaigns with tracking
  const wrappedSetCampaigns = (newCampaigns: MetaCampaign[]) => {
    console.log(`[MOCK DEBUG] Direct setCampaigns called with ${newCampaigns.length} campaigns from ${lastUpdateSourceRef.current}`);
    
    // Clear loading state when setting campaigns directly
    if (newCampaigns.length > 0 && isLoading) {
      console.log('[CAMPAIGN STATE] Setting campaigns directly, clearing loading state');
      setIsLoading(false);
    }
    
    setCampaigns(newCampaigns);
    
    // Mark that we've had campaigns if we're setting non-empty array
    if (newCampaigns.length > 0) {
      hasEverHadCampaignsRef.current = true;
    }
  };

  // New function to update campaigns with guaranteed UI refresh and additional insights fetch
  const updateCampaigns = async (newCampaigns: MetaCampaign[]) => {
    console.log(`[MOCK DEBUG] updateCampaigns called with ${newCampaigns.length} campaigns from ${lastUpdateSourceRef.current}`);
    lastUpdateSourceRef.current = 'updateCampaigns';
    
    // Log a sample campaign for debugging (if available)
    if (newCampaigns.length > 0) {
      const sample = newCampaigns[0];
      console.log('[CAMPAIGN STATE] Sample campaign:', {
        id: sample.id,
        name: sample.name,
        status: sample.status,
        hasInsights: !!sample.insights,
        insightKeys: sample.insights ? Object.keys(sample.insights) : []
      });
    }
    
    // Clear loading state when setting new campaigns
    if (newCampaigns.length > 0) {
      if (isLoading) {
        console.log('[CAMPAIGN STATE] Received campaigns, clearing loading state');
        setIsLoading(false);
      }
      hasEverHadCampaignsRef.current = true;
    }
    
    // First set the campaigns to show basic data immediately
    setCampaigns(newCampaigns);
    
    // Then fetch additional insights for each campaign
    try {
      const token = metaAuthService.getAccessToken();
      
      if (token && newCampaigns.length > 0) {
        console.log(`[CAMPAIGN STATE] Fetching additional insights for ${newCampaigns.length} campaigns`);
        
        // Keep the UI responsive by setting campaigns before the detailed fetch
        incrementDisplayRefresh();
        setForceRender(prev => prev + 1);
        
        // Fetch additional insights for each campaign
        const enhancedCampaigns = await fetchInsightsForCampaigns(newCampaigns, token);
        
        // Calculate how many campaigns received valid insights
        const campaignsWithInsights = enhancedCampaigns.filter(
          campaign => campaign.insights && 
            ((campaign.insights.spend && campaign.insights.spend !== '-') || 
             (campaign.insights.cpa && campaign.insights.cpa !== '-') || 
             (campaign.insights.roas && campaign.insights.roas !== '-'))
        );
        
        console.log(`[CAMPAIGN STATE] Insights fetch complete: ${campaignsWithInsights.length}/${enhancedCampaigns.length} campaigns have valid insights`);
        
        // Update the campaigns with the enhanced data
        console.log(`[CAMPAIGN STATE] Updating campaigns with enhanced insights data`);
        setCampaigns(enhancedCampaigns);
        incrementDisplayRefresh();
        setForceRender(prev => prev + 1);
        
        // Determine insights fetch status
        let insightsSuccess = false;
        let insightsPartial = false;
        
        if (campaignsWithInsights.length === enhancedCampaigns.length && enhancedCampaigns.length > 0) {
          insightsSuccess = true;
          console.log('[CAMPAIGN STATE] All campaigns received insights data successfully');
        } else if (campaignsWithInsights.length > 0) {
          insightsPartial = true;
          console.log('[CAMPAIGN STATE] Some campaigns received insights data');
        } else {
          console.log('[CAMPAIGN STATE] No campaigns received valid insights data');
        }
        
        // Return insights fetch status
        return { success: insightsSuccess, partial: insightsPartial };
      }
    } catch (error) {
      console.error('[CAMPAIGN STATE] Error fetching additional insights:', error);
      return { success: false, partial: false, error };
    }
    
    return { success: false, partial: false };
  };

  const updateFetchMetadata = (metadata: Partial<FetchMetadata>) => {
    setLastFetchMetadata(prev => ({
      status: metadata.status || prev?.status,
      success: metadata.success ?? prev?.success ?? false,
      campaignCount: metadata.campaignCount ?? prev?.campaignCount ?? 0,
      fetchedAt: metadata.fetchedAt || new Date().toISOString(),
      source: metadata.source || (localStorage.getItem("USE_MOCK_MODE") === "true" ? 'Mock Data' : 'Live Meta API')
    }));
  };

  return {
    // State
    campaigns,
    setCampaigns: wrappedSetCampaigns,
    updateCampaigns, // Now includes additional insights fetch
    isLoading,
    setIsLoading,
    error,
    setError,
    errorDetails,
    setErrorDetails,
    displayRefresh,
    forceRender, // Expose forceRender for components to use as key
    setForceRender, // Explicitly expose setForceRender
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh,
    
    // Refs
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef,
    campaignCountRef,
    lastFetchMetadata,
    updateFetchMetadata,
    hasEverHadCampaignsRef
  };
}
