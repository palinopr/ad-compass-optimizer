
import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { format } from 'date-fns';
import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';

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

      const validDatePreset = mapToValidDatePreset(datePreset);
      console.log(`[INSIGHTS] Using validated date preset: ${validDatePreset}`);

      // Common fields for all requests
      const commonFields = [
        'spend',
        'ctr',
        'impressions',
        'actions',
        'cost_per_action_type',
        'website_purchase_roas'
      ];

      // Create base options
      const baseOptions: InsightFilterOptions = {
        datePreset: validDatePreset as InsightFilterOptions['datePreset'],
        fields: commonFields,
      };

      // For today/yesterday, prepare time_range fallback
      const requests: (() => Promise<any>)[] = [];
      
      // Primary request with date_preset
      requests.push(() => itemType === 'campaign' 
        ? MetaInsightsService.fetchCampaignInsights(token, itemId, baseOptions)
        : MetaInsightsService.fetchAdSetInsights(token, itemId, baseOptions));

      // Add time_range fallback for today/yesterday
      if (validDatePreset === 'today' || validDatePreset === 'yesterday') {
        const date = validDatePreset === 'today' ? new Date() : new Date(Date.now() - 86400000);
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        const timeRangeOptions: InsightFilterOptions = {
          ...baseOptions,
          timeRange: {
            since: formattedDate,
            until: formattedDate
          },
          timeIncrement: 1
        };
        
        requests.push(() => itemType === 'campaign'
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, timeRangeOptions)
          : MetaInsightsService.fetchAdSetInsights(token, itemId, timeRangeOptions));
      }

      // Execute requests with throttling
      const results = await InsightsRequestThrottler.throttleRequests(requests);
      
      // Find first valid response
      const validResponse = results.find(response => response?.data?.length > 0) || results[0];

      if (!validResponse) {
        // Try maximum as last resort
        console.log('[INSIGHTS] No data from primary or fallback, trying maximum preset');
        const maximumResponse = await (itemType === 'campaign'
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, { ...baseOptions, datePreset: 'maximum' })
          : MetaInsightsService.fetchAdSetInsights(token, itemId, { ...baseOptions, datePreset: 'maximum' }));
        
        // Always use the response structure even if empty
        transformAndSetInsights(maximumResponse);
      } else {
        transformAndSetInsights(validResponse);
      }

    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError(err.message || 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to transform and set insights data
  const transformAndSetInsights = (response: any) => {
    const transformedData = {
      spend: response.data?.map((d: any) => ({
        date: d.date_start,
        value: parseFloat(d.spend || 0)
      })) || [],
      ctr: response.data?.map((d: any) => ({
        date: d.date_start,
        value: parseFloat(d.ctr || 0)
      })) || [],
      impressions: response.data?.map((d: any) => ({
        date: d.date_start,
        value: parseInt(d.impressions || 0)
      })) || []
    };
    
    setInsights(transformedData);
  };

  return {
    insights,
    isLoading,
    error,
    fetchInsights
  };
};
