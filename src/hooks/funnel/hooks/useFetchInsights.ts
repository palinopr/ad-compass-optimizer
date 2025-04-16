
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
    datePreset: string = 'last_30d' // Changed default from 'maximum' to last_30d
  ) => {
    console.log(`[INSIGHTS HOOK] Request started for ${itemType} ${itemId} with datePreset: ${datePreset}`);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const validDatePreset = safelyValidateDatePreset(datePreset);
      
      // Log the validated date preset
      console.log(`[INSIGHTS HOOK] Using validated datePreset: ${validDatePreset} for ${itemType} ${itemId}`);
      
      // Generate a unique request signature for this particular insights request
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(
        itemId, 
        `insights-${itemType}`, 
        { datePreset: validDatePreset }
      );
      
      // Check if this exact request previously failed with 400 - EARLY CHECK
      if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
        console.log(`[INSIGHTS HOOK] Skipped insights request due to permanent failure (400): ${itemId} with ${validDatePreset}`);
        throw new Error('This insights request previously failed due to a bad request (400)');
      }

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
        console.log(`[INSIGHTS HOOK] Marked request as permanently failed due to 400: ${itemId}`);
      }
      
      console.error('Error fetching insights:', err);
      throw err;
    }
  }, []);

  return { fetchInsights };
};
