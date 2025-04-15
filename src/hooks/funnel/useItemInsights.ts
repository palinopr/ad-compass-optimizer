import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { format } from 'date-fns';
import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';

const getDateRange = (datePreset: string) => {
  const date = datePreset === 'today' 
    ? new Date() 
    : new Date(Date.now() - 86400000); // yesterday
  
  const formattedDate = format(date, 'yyyy-MM-dd');
  return {
    since: formattedDate,
    until: formattedDate
  };
};

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
      let baseOptions: InsightFilterOptions = {
        fields: commonFields,
      };

      // Handle today/yesterday using time_range instead of date_preset
      if (['today', 'yesterday'].includes(validDatePreset)) {
        const timeRange = getDateRange(validDatePreset);
        baseOptions = {
          ...baseOptions,
          timeRange,
          timeIncrement: 1
        };
      } else {
        baseOptions.datePreset = validDatePreset as InsightFilterOptions['datePreset'];
      }

      // Execute primary request
      const primaryRequest = () => itemType === 'campaign' 
        ? MetaInsightsService.fetchCampaignInsights(token, itemId, baseOptions)
        : MetaInsightsService.fetchAdSetInsights(token, itemId, baseOptions);

      // Execute request with throttling
      const response = await InsightsRequestThrottler.throttleRequests([primaryRequest]);
      const validResponse = response[0];

      if (!validResponse || !validResponse.data?.length) {
        // Try maximum as last resort
        console.log('[INSIGHTS] No data from primary request, trying maximum preset');
        const maximumResponse = await (itemType === 'campaign'
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, { ...baseOptions, datePreset: 'maximum' })
          : MetaInsightsService.fetchAdSetInsights(token, itemId, { ...baseOptions, datePreset: 'maximum' }));
        
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
