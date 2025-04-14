import { useRef, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

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
    
    // Update fetch metadata when campaigns change
    if (campaigns.length !== prevCount) {
      updateFetchMetadata({
        success: true,
        campaignCount: campaigns.length,
        status: 200,
      });
    }
  }, [campaigns]);

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
    setCampaigns(newCampaigns);
  };

  // New function to update campaigns with guaranteed UI refresh
  const updateCampaigns = (newCampaigns: MetaCampaign[]) => {
    console.log(`[MOCK DEBUG] updateCampaigns called with ${newCampaigns.length} campaigns from ${lastUpdateSourceRef.current}`);
    lastUpdateSourceRef.current = 'updateCampaigns';
    setCampaigns(newCampaigns);
    incrementDisplayRefresh();
    setForceRender(prev => prev + 1);
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
    updateCampaigns, // New method for guaranteed update
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
    updateFetchMetadata
  };
}
