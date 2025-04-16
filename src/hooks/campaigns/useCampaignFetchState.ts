
import { useRef } from 'react';
import { useCampaignState } from './fetch-hooks/useCampaignState';
import { useInsightsFetching } from './fetch-hooks/useInsightsFetching';
import { useLoadingSafety } from './fetch-hooks/useLoadingSafety';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

export function useCampaignFetchState() {
  const {
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
    fetchCompleted,
    setFetchCompleted,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh
  } = useCampaignState();

  const { insightsFetchStatus, updateCampaignsWithInsights } = useInsightsFetching();
  const hasEverHadCampaignsRef = useRef<boolean>(false);

  useLoadingSafety(isLoading, hasEverHadCampaignsRef.current, () => {
    setIsLoading(false);
    setFetchCompleted(true);
  });

  const updateCampaigns = async (newCampaigns: MetaCampaign[]) => {
    console.log(`[CAMPAIGN STATE] Updating campaigns with ${newCampaigns.length} items`);
    
    if (newCampaigns.length > 0) {
      hasEverHadCampaignsRef.current = true;
      if (isLoading) {
        setIsLoading(false);
      }
    }

    setCampaigns(newCampaigns);
    setForceRender(prev => prev + 1);

    const insightsResult = await updateCampaignsWithInsights(newCampaigns);
    if (insightsResult.campaigns) {
      setCampaigns(insightsResult.campaigns);
      setForceRender(prev => prev + 1);
    }

    return insightsResult;
  };

  return {
    campaigns,
    setCampaigns,
    updateCampaigns,
    isLoading,
    setIsLoading,
    error,
    setError,
    errorDetails,
    setErrorDetails,
    displayRefresh,
    forceRender,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh,
    hasEverHadCampaignsRef,
    fetchCompleted,
    setFetchCompleted,
    insightsFetchStatus
  };
}
