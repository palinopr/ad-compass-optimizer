
import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { format } from 'date-fns';
import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';

const getDateRange = (preset: string) => {
  const date = preset === 'today' 
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

      // Strictly validate the date preset
      const validDatePreset = mapToValidDatePreset(datePreset);
      console.log(`[INSIGHTS] Using strictly validated date preset: ${validDatePreset}`);

      // Common fields for all requests
      const commonFields = [
        'spend',
        'ctr',
        'impressions',
        'actions',
        'cost_per_action_type',
        'website_purchase_roas'
      ];

      // Create base options without datePreset
      const baseOptions: Omit<InsightFilterOptions, 'datePreset' | 'timeRange'> = {
        fields: commonFields,
        timeIncrement: 1 // Always use time_increment=1 for consistent data breakdown
      };

      // Prepare requests array for batching
      const requests: (() => Promise<any>)[] = [];

      // For today/yesterday use time_range, otherwise use date_preset
      // Ensure mutual exclusivity between time_range and date_preset
      const primaryOptions: InsightFilterOptions = {
        ...baseOptions,
      };

      if (['today', 'yesterday'].includes(validDatePreset)) {
        primaryOptions.timeRange = getDateRange(validDatePreset);
        console.log(`[INSIGHTS] Using time_range instead of date_preset for ${validDatePreset}`);
      } else {
        primaryOptions.datePreset = validDatePreset as InsightFilterOptions['datePreset'];
      }

      // Add primary request
      requests.push(() => itemType === 'campaign'
        ? MetaInsightsService.fetchCampaignInsights(token, itemId, primaryOptions)
        : MetaInsightsService.fetchAdSetInsights(token, itemId, primaryOptions));

      // Add fallback request with maximum date range
      const fallbackOptions: InsightFilterOptions = {
        ...baseOptions,
        datePreset: 'maximum',
      };

      requests.push(() => itemType === 'campaign'
        ? MetaInsightsService.fetchCampaignInsights(token, itemId, fallbackOptions)
        : MetaInsightsService.fetchAdSetInsights(token, itemId, fallbackOptions));

      // Execute requests with throttling
      const results = await InsightsRequestThrottler.throttleRequests(requests);
      
      // Find first valid response with data
      const validResponse = results.find(response => response?.data?.length > 0) || results[0];

      if (validResponse) {
        transformAndSetInsights(validResponse);
        console.log(`[INSIGHTS] Successfully processed insights data for ${itemType} ${itemId}`, validResponse);
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

  // Helper to transform and set insights data with improved extraction of metrics
  const transformAndSetInsights = (response: any) => {
    if (!response?.data || response.data.length === 0) {
      console.warn('[INSIGHTS] Response contains no data to transform');
      setInsights(null);
      return;
    }

    console.log('[INSIGHTS] Transforming data:', response.data);

    // Basic time-series metrics
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

    // Extract additional performance metrics
    const latestData = response.data[0]; // Most recent data point
    const additionalMetrics: any = {};

    // Process cost per action type data
    if (latestData.cost_per_action_type && Array.isArray(latestData.cost_per_action_type)) {
      // Find purchase-related CPA
      const purchaseCpa = latestData.cost_per_action_type.find(
        (item: any) => item.action_type === 'purchase' || 
                      item.action_type === 'omni_purchase' ||
                      item.action_type === 'offsite_conversion'
      );

      if (purchaseCpa) {
        additionalMetrics.cpa = purchaseCpa.value;
        console.log('[INSIGHTS] Found CPA:', purchaseCpa.value);
      }
    }

    // Process ROAS data
    if (latestData.website_purchase_roas && Array.isArray(latestData.website_purchase_roas)) {
      const purchaseRoas = latestData.website_purchase_roas[0];
      if (purchaseRoas && purchaseRoas.value) {
        const roasValue = parseFloat(purchaseRoas.value);
        additionalMetrics.roas = `${roasValue.toFixed(2)}x`;
        console.log('[INSIGHTS] Found ROAS:', additionalMetrics.roas);
      }
    }

    // Process actions data to find conversions/purchases
    if (latestData.actions && Array.isArray(latestData.actions)) {
      const purchaseAction = latestData.actions.find(
        (item: any) => item.action_type === 'purchase' || 
                      item.action_type === 'omni_purchase' ||
                      item.action_type === 'offsite_conversion'
      );

      if (purchaseAction) {
        additionalMetrics.conversions = purchaseAction.value;
        console.log('[INSIGHTS] Found conversions:', purchaseAction.value);
      }
    }

    // Add additional metrics to the transformed data
    const enhancedData = {
      ...transformedData,
      ...additionalMetrics
    };

    console.log('[INSIGHTS] Final transformed data:', enhancedData);
    setInsights(enhancedData);
  };

  return {
    insights,
    isLoading,
    error,
    fetchInsights
  };
};
