
import { useState, useCallback } from 'react';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

export const useCampaignState = () => {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [displayRefresh, setDisplayRefresh] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  const incrementDisplayRefresh = useCallback(() => {
    setDisplayRefresh(prev => prev + 1);
  }, []);

  const clearCampaigns = useCallback(() => {
    console.log('[CAMPAIGN STATE] Clearing campaign state');
    setCampaigns([]);
  }, []);

  const forceUiRefresh = useCallback(() => {
    console.log('[CAMPAIGN STATE] Forcing UI refresh');
    setForceRender(prev => prev + 1);
    setTimeout(() => {
      setDisplayRefresh(prev => prev + 1);
    }, 50);
  }, []);

  return {
    campaigns,
    setCampaigns,
    isLoading,
    setIsLoading,
    error,
    setError,
    errorDetails,
    setErrorDetails,
    displayRefresh,
    forceRender,
    setForceRender, // Make sure we export this function
    fetchCompleted,
    setFetchCompleted,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh
  };
};
