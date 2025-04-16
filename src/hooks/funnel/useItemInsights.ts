
import { useState, useCallback } from 'react';
import { MetaInsightsService, InsightFilterOptions } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { format } from 'date-fns';
import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

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

// Helper function to aggressively block problematic date presets
const safelyValidateDatePreset = (datePreset: string): string => {
  // Always log what we're validating
  console.log(`[INSIGHTS HOOK] Validating datePreset: "${datePreset}"`);
  
  // Block last_28d and similar patterns
  if (datePreset === 'last_28d' || 
      datePreset.includes('28d') || 
      datePreset.includes('28day')) {
    console.warn(`[INSIGHTS HOOK] Blocking problematic date preset "${datePreset}", using maximum instead`);
    
    // Track this replacement for debugging
    try {
      const blockedHookRequests = JSON.parse(localStorage.getItem('hook_blocked_28d_requests') || '[]');
      blockedHookRequests.push({
        timestamp: new Date().toISOString(),
        original: datePreset,
        replacedWith: 'maximum',
        location: 'useItemInsights.safelyValidateDatePreset'
      });
      localStorage.setItem('hook_blocked_28d_requests', JSON.stringify(blockedHookRequests.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
    
    return 'maximum';
  }
  
  // Use the existing mapper, but override any "last_28d" it might return
  const mappedPreset = mapToValidDatePreset(datePreset);
  
  // Double-check that the mapping didn't give us a problematic preset
  if (mappedPreset === 'last_28d') {
    console.warn(`[INSIGHTS HOOK] Mapping returned problematic preset "last_28d", overriding to maximum`);
    return 'maximum';
  }
  
  return mappedPreset;
};

export const useItemInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'  // Changed default from 'maximum' to make this consistent
  ) => {
    setIsLoading(true);
    setError(null);
    
    console.log(`[INSIGHTS HOOK] Request started for ${itemType} ${itemId} with datePreset: ${datePreset}`);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Use our enhanced validation function to ensure safe date presets
      const validDatePreset = safelyValidateDatePreset(datePreset);
      
      // Log that we're proceeding with the validated preset
      console.log(`[INSIGHTS HOOK] Proceeding with validated datePreset: "${validDatePreset}" for ${itemType} ${itemId}`);
      
      // Generate a unique request signature for this particular insights request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(
        itemId, 
        `insights-${itemType}`, 
        { datePreset: validDatePreset }
      );
      
      // Check if this exact request previously failed with 400 - EARLY CHECK
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`[INSIGHTS HOOK] Skipped insights request due to permanent failure (400): ${itemId} with ${validDatePreset}`);
        setError('This insights request previously failed due to a bad request (400)');
        setIsLoading(false);
        return;
      }

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
        console.log(`[INSIGHTS HOOK] Using time_range instead of date_preset for ${validDatePreset}`);
      } else {
        primaryOptions.datePreset = validDatePreset as InsightFilterOptions['datePreset'];
      }

      // Add primary request with request signature checking
      requests.push(() => {
        // Double-check just before execution if this request has been marked as failed
        const doubleCheckSignature = DuplicateRequestChecker.generateRequestSignature(
          itemId, 
          `insights-${itemType}`, 
          primaryOptions.datePreset ? { datePreset: primaryOptions.datePreset } : 
                                    { timeRange: primaryOptions.timeRange }
        );
        
        if (DuplicateRequestChecker.isPermanentlyFailed(doubleCheckSignature)) {
          console.log(`[INSIGHTS HOOK] Last-minute abort of request ${doubleCheckSignature} (previously failed with 400)`);
          return Promise.reject({
            message: 'Request skipped due to previous 400 error',
            status: 400,
            skipped: true
          });
        }
        
        return itemType === 'campaign'
          ? MetaInsightsService.fetchCampaignInsights(token, itemId, primaryOptions)
          : MetaInsightsService.fetchAdSetInsights(token, itemId, primaryOptions)
          .catch(error => {
            // Mark this request signature as permanently failed if it's a 400
            if (error.status === 400 || (error.response && error.response.status === 400)) {
              console.log(`[INSIGHTS HOOK] Marking request as permanently failed due to 400: ${doubleCheckSignature}`);
              DuplicateRequestChecker.markAsPermanentlyFailed(doubleCheckSignature);
              
              // Log the failure details
              try {
                const failureLog = JSON.parse(localStorage.getItem('insights_400_failures_hook') || '[]');
                failureLog.push({
                  timestamp: new Date().toISOString(),
                  itemId,
                  itemType,
                  options: JSON.stringify(primaryOptions),
                  error: error.message || 'API Error 400'
                });
                localStorage.setItem('insights_400_failures_hook', JSON.stringify(failureLog.slice(-20)));
              } catch (e) {
                // Ignore storage errors
              }
            }
            throw error;
          });
      });

      // Generate a separate signature for the fallback request
      const fallbackOptions: InsightFilterOptions = {
        ...baseOptions,
        datePreset: 'maximum',
      };

      // Only add fallback if the primary isn't already using maximum
      if (validDatePreset !== 'maximum') {
        const fallbackSignature = DuplicateRequestChecker.generateRequestSignature(
          itemId, 
          `insights-${itemType}-fallback`, 
          fallbackOptions
        );
        
        requests.push(() => {
          // Check if fallback request has been marked as failed
          if (DuplicateRequestChecker.isPermanentlyFailed(fallbackSignature)) {
            console.log(`[INSIGHTS HOOK] Skipping execution of fallback request ${fallbackSignature} (previously failed with 400)`);
            return Promise.reject({
              message: 'Fallback request skipped due to previous 400 error',
              status: 400,
              skipped: true
            });
          }
          
          return itemType === 'campaign'
            ? MetaInsightsService.fetchCampaignInsights(token, itemId, fallbackOptions)
            : MetaInsightsService.fetchAdSetInsights(token, itemId, fallbackOptions)
            .catch(error => {
              // Mark fallback request as permanently failed if it's a 400
              if (error.status === 400 || (error.response && error.response.status === 400)) {
                console.log(`[INSIGHTS HOOK] Marking fallback request as permanently failed due to 400: ${fallbackSignature}`);
                DuplicateRequestChecker.markAsPermanentlyFailed(fallbackSignature);
              }
              throw error;
            });
        });
      }

      // Execute requests with throttling
      const results = await InsightsRequestThrottler.throttleRequests(requests, `insights-${itemType}-${itemId}`);
      
      // Find first valid response with data
      const validResponse = results.find(response => response?.data?.length > 0) || results[0];

      if (validResponse) {
        transformAndSetInsights(validResponse);
        console.log(`[INSIGHTS HOOK] Successfully processed insights data for ${itemType} ${itemId}`, validResponse);
      } else {
        console.error('[INSIGHTS HOOK] No data from any fetch attempt');
        setError('No insights data available');
      }

    } catch (err: any) {
      console.error('Error fetching insights:', err);
      
      if (err.status === 400 || (err.response && err.response.status === 400)) {
        // Store this so we don't retry
        const errorSignature = DuplicateRequestChecker.generateRequestSignature(
          itemId,
          `insights-${itemType}-error`,
          { datePreset }
        );
        
        DuplicateRequestChecker.markAsPermanentlyFailed(errorSignature);
        console.log(`[INSIGHTS HOOK] Marked failed request due to catch block: ${errorSignature}`);
        
        setError('The insights request failed due to an invalid parameter (400 error)');
      } else {
        setError(err.message || 'Failed to fetch insights');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to transform and set insights data with improved extraction of metrics
  const transformAndSetInsights = (response: any) => {
    if (!response?.data || response.data.length === 0) {
      console.warn('[INSIGHTS HOOK] Response contains no data to transform');
      setInsights(null);
      return;
    }

    console.log('[INSIGHTS HOOK] Transforming data:', response.data);

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
        console.log('[INSIGHTS HOOK] Found CPA:', purchaseCpa.value);
      }
    }

    // Process ROAS data
    if (latestData.website_purchase_roas && Array.isArray(latestData.website_purchase_roas)) {
      const purchaseRoas = latestData.website_purchase_roas[0];
      if (purchaseRoas && purchaseRoas.value) {
        const roasValue = parseFloat(purchaseRoas.value);
        additionalMetrics.roas = `${roasValue.toFixed(2)}x`;
        console.log('[INSIGHTS HOOK] Found ROAS:', additionalMetrics.roas);
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
        console.log('[INSIGHTS HOOK] Found conversions:', purchaseAction.value);
      }
    }

    // Add additional metrics to the transformed data
    const enhancedData = {
      ...transformedData,
      ...additionalMetrics
    };

    console.log('[INSIGHTS HOOK] Final transformed data:', enhancedData);
    setInsights(enhancedData);
  };

  return {
    insights,
    isLoading,
    error,
    fetchInsights
  };
};
