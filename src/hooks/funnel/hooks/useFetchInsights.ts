
import { useCallback } from 'react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { metaAuthService } from '@/services/MetaAuthService';
import { safelyValidateDatePreset } from '../utils/datePresetValidation';
import { getDateRange } from '../utils/dateUtils';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';
import { InsightOptions } from '@/types/insights';

export const useFetchInsights = () => {
  const fetchInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'last_30d'
  ) => {
    console.log(`[INSIGHTS HOOK] Request started for ${itemType} ${itemId} with datePreset: ${datePreset}`);

    // Validate campaign ID
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      console.warn(`⚠️ Skipping insights fetch: Invalid ${itemType} ID`);
      return null;
    }

    // Check if this exact request previously failed with 400 - EARLY CHECK
    const requestSignature = DuplicateRequestChecker.generateRequestSignature(
      itemId, 
      `insights-${itemType}`, 
      { datePreset }
    );
    
    if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
      console.log(`⚠️ Skipping insights fetch for ${itemType} ${itemId}: 400 error or missing data.`);
      return null;
    }

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Force date_preset to last_30d regardless of input
      const forcedDatePreset = 'last_30d';
      if (datePreset !== forcedDatePreset) {
        console.log(`[INSIGHTS HOOK] Overriding input date_preset '${datePreset}' with forced value '${forcedDatePreset}'`);
        datePreset = forcedDatePreset;
      }
      
      const validDatePreset = safelyValidateDatePreset(datePreset);
      
      // Log the validated date preset
      console.log(`[INSIGHTS HOOK] Using validated datePreset: ${validDatePreset} for ${itemType} ${itemId}`);
      
      const commonFields = [
        'spend',
        'ctr',
        'impressions',
        'actions',
        'cost_per_action_type',
        'website_purchase_roas'
      ];

      const baseOptions: InsightOptions = {
        fields: commonFields,
        timeIncrement: 1
      };

      if (['today', 'yesterday'].includes(validDatePreset)) {
        baseOptions.timeRange = getDateRange(validDatePreset);
        console.log(`[INSIGHTS HOOK] Using time_range instead of date_preset for ${validDatePreset}`);
      } else {
        baseOptions.datePreset = validDatePreset;
        console.log(`[INSIGHTS HOOK] Setting datePreset=${validDatePreset} in options`);
      }

      // Log the full options being used
      console.log(`[INSIGHTS HOOK] Full options for fetch:`, JSON.stringify(baseOptions));
      
      // NEW: Log to confirm the date parameter is properly set
      if (baseOptions.datePreset) {
        console.log(`✅ Insights request will include date_preset=${baseOptions.datePreset}`);
      } else if (baseOptions.timeRange) {
        console.log(`✅ Insights request will include time_range=${JSON.stringify(baseOptions.timeRange)}`);
      }

      const response = await MetaFunnelService.fetchFunnelData(token, itemId, validDatePreset);
      
      // Check for empty response data
      if (response && response.campaigns && response.campaigns.length > 0) {
        const emptyCampaigns = response.campaigns.filter(c => !c || Object.keys(c).length === 0).length;
        if (emptyCampaigns > 0) {
          console.warn(`[INSIGHTS HOOK] Warning: ${emptyCampaigns}/${response.campaigns.length} campaigns are empty objects`);
        }
      }
      
      return response;

    } catch (err: any) {
      // If it's a 400 error, ensure it's marked as permanently failed
      if (err.status === 400 || (err.response?.status === 400)) {
        const failureSignature = DuplicateRequestChecker.generateRequestSignature(
          itemId,
          `insights-${itemType}`,
          { datePreset }
        );
        DuplicateRequestChecker.markAsPermanentlyFailed(failureSignature);
        console.log(`⚠️ Skipping insights fetch for ${itemType} ${itemId}: 400 error or missing data.`);
      }
      
      console.error('Error fetching insights:', err);
      throw err;
    }
  }, []);

  return { fetchInsights };
};
