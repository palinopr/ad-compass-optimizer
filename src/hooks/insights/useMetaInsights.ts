
import { useCallback } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { InsightFilterOptions, InsightsResponse } from '@/services/api/MetaInsightsService';
import { useRateLimitStatus } from './useRateLimitStatus';
import { useInsightsFetching } from './useInsightsFetching';

interface UseMetaInsightsReturn {
  insights: InsightsResponse | null;
  isLoading: boolean;
  error: string | null;
  rateLimitStatus: {
    isRateLimited: boolean;
    limitType?: string;
    timeRemaining?: number | null;
  };
  fetchInsights: (objectId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchCampaignInsights: (campaignId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAccountInsights: (accountId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdSetInsights: (adSetId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  fetchAdInsights: (adId: string, options?: InsightFilterOptions) => Promise<InsightsResponse | null>;
  clearRateLimit: () => void;
  resetErrorState: () => void;
}

export function useMetaInsights(): UseMetaInsightsReturn {
  const { rateLimitStatus, clearRateLimit } = useRateLimitStatus();
  const { insights, isLoading, error, handleInsightsFetch, resetErrorState } = useInsightsFetching();
  
  // Individual fetch methods for different insight types
  const fetchInsights = useCallback((objectId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaApiService.fetchInsights, objectId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchCampaignInsights = useCallback((campaignId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaApiService.fetchCampaignInsights, campaignId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAccountInsights = useCallback((accountId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(MetaApiService.fetchAccountInsights, accountId, options || {});
  }, [handleInsightsFetch]);
  
  const fetchAdSetInsights = useCallback((adSetId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(
      (token, id, opts) => MetaApiService.fetchInsights(token, id, { ...opts, level: 'adset' }), 
      adSetId,
      options || {}
    );
  }, [handleInsightsFetch]);
  
  const fetchAdInsights = useCallback((adId: string, options?: InsightFilterOptions) => {
    return handleInsightsFetch(
      (token, id, opts) => MetaApiService.fetchInsights(token, id, { ...opts, level: 'ad' }), 
      adId,
      options || {}
    );
  }, [handleInsightsFetch]);
  
  return {
    insights,
    isLoading,
    error,
    rateLimitStatus,
    fetchInsights,
    fetchCampaignInsights,
    fetchAccountInsights,
    fetchAdSetInsights,
    fetchAdInsights,
    clearRateLimit,
    resetErrorState
  };
}
