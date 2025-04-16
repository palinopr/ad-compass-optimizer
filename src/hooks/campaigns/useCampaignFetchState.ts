
import { useRef, useState } from 'react';
import { useCampaignState } from './fetch-hooks/useCampaignState';
import { useInsightsFetching } from './fetch-hooks/useInsightsFetching';
import { useLoadingSafety } from './fetch-hooks/useLoadingSafety';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

export interface FetchMetadata {
  campaignCount: number;
  timestamp: string;
  source?: string;
}

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
    setForceRender, // Get the setForceRender from useCampaignState
    fetchCompleted,
    setFetchCompleted,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh
  } = useCampaignState();

  const [lastFetchMetadata, setLastFetchMetadata] = useState<FetchMetadata>({
    campaignCount: 0,
    timestamp: '',
  });
  
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

    // Update the lastFetchMetadata when campaigns are updated
    setLastFetchMetadata({
      campaignCount: newCampaigns.length,
      timestamp: new Date().toISOString(),
      source: localStorage.getItem('last_campaign_source') || undefined
    });

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
    insightsFetchStatus,
    lastFetchMetadata // Add the lastFetchMetadata to the return object
  };
}
