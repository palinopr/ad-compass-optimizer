
import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';

export const useItemInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (itemId: string, itemType: 'campaign' | 'adset') => {
    setIsLoading(true);
    setError(null);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const options: InsightFilterOptions = {
        datePreset: 'last_30d',
        fields: ['spend', 'ctr', 'impressions'],
      };

      const response = itemType === 'campaign' 
        ? await MetaInsightsService.fetchCampaignInsights(token, itemId, options)
        : await MetaInsightsService.fetchAdSetInsights(token, itemId, options);

      // Transform the data for charting
      const transformedData = {
        spend: response.data.map((d: any) => ({
          date: d.date_start,
          value: parseFloat(d.spend || 0)
        })),
        ctr: response.data.map((d: any) => ({
          date: d.date_start,
          value: parseFloat(d.ctr || 0)
        })),
        impressions: response.data.map((d: any) => ({
          date: d.date_start,
          value: parseInt(d.impressions || 0)
        }))
      };

      setInsights(transformedData);
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insights,
    isLoading,
    error,
    fetchInsights
  };
};
