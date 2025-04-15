
import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export const useItemInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'last_28d'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Map any legacy presets to valid Meta API values
      const validDatePreset = mapToValidDatePreset(datePreset) as InsightFilterOptions['datePreset'];

      const options: InsightFilterOptions = {
        datePreset: validDatePreset,
        fields: ['spend', 'ctr', 'impressions'],
      };

      console.log(`[INSIGHTS] Fetching ${itemType} insights using date preset: ${options.datePreset}`);

      try {
        const response = itemType === 'campaign' 
          ? await MetaInsightsService.fetchCampaignInsights(token, itemId, options)
          : await MetaInsightsService.fetchAdSetInsights(token, itemId, options);

        // Check if we have meaningful data
        if (!response.data || response.data.length === 0) {
          throw new Error('No insights data available with the current date preset');
        }

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
      } catch (err) {
        console.error(`[INSIGHTS] Error with date preset ${validDatePreset}, trying maximum:`, err);
        
        // Try with maximum preset if original request failed
        const fallbackOptions: InsightFilterOptions = {
          datePreset: 'maximum',
          fields: ['spend', 'ctr', 'impressions'],
        };
        
        console.log(`[INSIGHTS] Falling back to maximum preset for ${itemType} ${itemId}`);
        
        const fallbackResponse = itemType === 'campaign' 
          ? await MetaInsightsService.fetchCampaignInsights(token, itemId, fallbackOptions)
          : await MetaInsightsService.fetchAdSetInsights(token, itemId, fallbackOptions);
        
        // Transform the data for charting
        const transformedData = {
          spend: fallbackResponse.data.map((d: any) => ({
            date: d.date_start,
            value: parseFloat(d.spend || 0)
          })),
          ctr: fallbackResponse.data.map((d: any) => ({
            date: d.date_start,
            value: parseFloat(d.ctr || 0)
          })),
          impressions: fallbackResponse.data.map((d: any) => ({
            date: d.date_start,
            value: parseInt(d.impressions || 0)
          }))
        };

        setInsights(transformedData);
      }
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
