
import { useRef, useState, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

/**
 * Hook for managing campaign fetch state with improved UI refresh capabilities
 */
export function useCampaignFetchState() {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [displayRefresh, setDisplayRefresh] = useState<number>(0);
  
  // Use refs to prevent multiple concurrent fetches
  const isFetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const campaignCountRef = useRef<number>(0);

  // Set mounted flag on component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update campaign count ref whenever campaigns change
  useEffect(() => {
    campaignCountRef.current = campaigns.length;
    // Log for debugging
    console.log(`Campaign count updated: ${campaignCountRef.current}`);
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
    console.log('Clearing campaign state');
    setCampaigns([]);
    campaignCountRef.current = 0;
  };

  // Function to force a UI refresh
  const forceUiRefresh = () => {
    console.log('Forcing UI refresh');
    incrementDisplayRefresh();
    // Trigger React to re-render by cloning the campaigns array
    if (campaigns.length > 0) {
      setCampaigns([...campaigns]);
    }
  };

  return {
    // State
    campaigns,
    setCampaigns,
    isLoading,
    setIsLoading,
    error,
    setError,
    errorDetails,
    setErrorDetails,
    displayRefresh,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh,
    
    // Refs
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef,
    campaignCountRef
  };
}
