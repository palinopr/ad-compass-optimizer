
import { useCallback } from 'react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { metaAuthService } from '@/services/MetaAuthService';
import { safelyValidateDatePreset } from '../utils/datePresetValidation';
import { getDateRange } from '../utils/dateUtils';

export const useFetchInsights = () => {
  const fetchInsights = useCallback(async (
    itemId: string, 
    itemType: 'campaign' | 'adset',
    datePreset: string = 'maximum'
  ) => {
    console.log(`[INSIGHTS HOOK] Request started for ${itemType} ${itemId} with datePreset: ${datePreset}`);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const validDatePreset = safelyValidateDatePreset(datePreset);
      
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

      const baseOptions = {
        fields: commonFields,
        timeIncrement: 1
      };

      const primaryOptions = {
        ...baseOptions,
      };

      if (['today', 'yesterday'].includes(validDatePreset)) {
        primaryOptions.timeRange = getDateRange(validDatePreset);
        console.log(`[INSIGHTS HOOK] Using time_range instead of date_preset for ${validDatePreset}`);
      } else {
        primaryOptions.datePreset = validDatePreset;
      }

      const response = await MetaFunnelService.fetchFunnelData(token, itemId, validDatePreset);
      return response;

    } catch (err: any) {
      console.error('Error fetching insights:', err);
      throw err;
    }
  }, []);

  return { fetchInsights };
};
