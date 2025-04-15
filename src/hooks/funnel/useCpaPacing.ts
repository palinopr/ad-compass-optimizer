
import { useState, useEffect } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

type CPAStatus = {
  status: 'on-target' | 'high' | 'low';
  message: string;
  icon: string;
  currentCPA: number;
  targetCPA?: number;
  daysLow?: number;
};

export const useCpaPacing = (itemId: string, targetCPA?: number) => {
  const [cpaStatus, setCpaStatus] = useState<CPAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCPAPacing = async () => {
      if (!itemId) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = metaAuthService.getAccessToken();
        if (!token) throw new Error('No access token available');

        // Fetch last 7 days of cost per action data with fallback to maximum if needed
        try {
          const response = await MetaInsightsService.fetchInsights(token, itemId, {
            datePreset: 'last_7d',
            fields: ['cpa', 'spend', 'actions']
          });

          // Check if we have valid data
          if (!response.data || response.data.length === 0) {
            throw new Error('No data available with last_7d preset');
          }

          processCPAData(response);
        } catch (err) {
          console.error('[CPA PACING] Error with last_7d preset, trying maximum:', err);
          
          // Try with maximum preset as fallback
          const fallbackResponse = await MetaInsightsService.fetchInsights(token, itemId, {
            datePreset: 'maximum',
            fields: ['cpa', 'spend', 'actions']
          });
          
          processCPAData(fallbackResponse);
        }
      } catch (err: any) {
        console.error('Error checking CPA pacing:', err);
        setError(err.message || 'Failed to check CPA pacing');
        setIsLoading(false);
      }
    };

    // Helper function to process CPA data
    const processCPAData = (response: any) => {
      // Calculate current CPA
      const currentCPA = response.data[0]?.cpa 
        ? parseFloat(response.data[0].cpa) 
        : (parseFloat(response.data[0].spend) / parseInt(response.data[0].actions));

      if (!targetCPA) {
        setCpaStatus({
          status: 'on-target',
          message: `Current CPA: $${currentCPA.toFixed(2)}`,
          icon: 'ℹ️',
          currentCPA
        });
        setIsLoading(false);
        return;
      }

      // Check if CPA is more than 30% above target
      const isHigh = currentCPA > targetCPA * 1.3;

      // Count consecutive days with low CPA
      let consecutiveLowDays = 0;
      for (const day of response.data) {
        const dayCPA = parseFloat(day.cpa) || (parseFloat(day.spend) / parseInt(day.actions));
        if (dayCPA < targetCPA * 0.8) {
          consecutiveLowDays++;
        } else {
          break;
        }
      }

      if (isHigh) {
        setCpaStatus({
          status: 'high',
          message: `CPA ${((currentCPA/targetCPA - 1) * 100).toFixed(0)}% above target`,
          icon: '⚠️',
          currentCPA,
          targetCPA
        });
      } else if (consecutiveLowDays >= 2) {
        setCpaStatus({
          status: 'low',
          message: `CPA consistently low - consider increasing budget`,
          icon: '✅',
          currentCPA,
          targetCPA,
          daysLow: consecutiveLowDays
        });
      } else {
        setCpaStatus({
          status: 'on-target',
          message: 'CPA within target range',
          icon: '✅',
          currentCPA,
          targetCPA
        });
      }
      
      setIsLoading(false);
    };

    checkCPAPacing();
  }, [itemId, targetCPA]);

  return { cpaStatus, isLoading, error };
};
