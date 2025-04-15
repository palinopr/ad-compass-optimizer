
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

      // Prepare requests array for batching
      const requests: (() => Promise<any>)[] = [];
      
      // For today/yesterday, use time_range with time_increment=1 instead of date_preset
      if (['today', 'yesterday'].includes(validDatePreset)) {
        const timeRange = getDateRange(validDatePreset);
        const timeRangeOptions: InsightFilterOptions = {
          ...baseOptions,
          timeRange,
          timeIncrement: 1
        };
        
        // Primary request with time_range
        requests.push(() => itemType === 'campaign' 
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, timeRangeOptions)
          : MetaInsightsService.fetchAdSetInsights(token, itemId, timeRangeOptions));
      } else {
        // For other presets, use date_preset
        baseOptions.datePreset = validDatePreset as InsightFilterOptions['datePreset'];
        
        // Primary request with date_preset
        requests.push(() => itemType === 'campaign' 
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, baseOptions)
          : MetaInsightsService.fetchAdSetInsights(token, itemId, baseOptions));
      }

      // Add maximum fallback for all cases
      requests.push(() => {
        const maximumOptions = { ...baseOptions, datePreset: 'maximum' };
        return itemType === 'campaign'
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, maximumOptions)
          : MetaInsightsService.fetchAdSetInsights(token, itemId, maximumOptions);
      });

      // Execute requests with throttling
      const results = await InsightsRequestThrottler.throttleRequests(requests);
      
      // Find first valid response with data
      const validResponse = results.find(response => response?.data?.length > 0) || results[0];

      if (validResponse) {
        transformAndSetInsights(validResponse);
      } else {
        console.error('[INSIGHTS] No data from any fetch attempt');
        setError('No insights data available');
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
