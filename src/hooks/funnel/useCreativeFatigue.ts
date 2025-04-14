
import { useState, useEffect } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';

type FatigueStatus = {
  status: 'fresh' | 'refresh-soon' | 'fatigue-detected';
  message: string;
  icon: string;
  metrics?: {
    ctrChange: number;
    cpmChange: number;
    conversionRateChange: number;
  };
};

export const useCreativeFatigue = (itemId: string, creationDate?: string) => {
  const [fatigueStatus, setFatigueStatus] = useState<FatigueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFatigue = async () => {
      if (!itemId || !creationDate) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = metaAuthService.getAccessToken();
        if (!token) throw new Error('No access token available');

        // Calculate age in days
        const ageInDays = Math.floor(
          (Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // If creative is less than 7 days old, mark as fresh
        if (ageInDays < 7) {
          setFatigueStatus({
            status: 'fresh',
            message: 'Creative performing well',
            icon: '✅'
          });
          return;
        }

        // Fetch last 14 days of data to compare
        const response = await MetaInsightsService.fetchInsights(token, itemId, {
          datePreset: 'last_14d',
          fields: ['ctr', 'cpm', 'conversion_rate']
        });

        // Split data into recent (7 days) and previous (7 days)
        const recentData = response.data.slice(0, 7);
        const previousData = response.data.slice(7);

        // Calculate averages
        const calculateAverage = (data: any[], field: string) => 
          data.reduce((sum, day) => sum + (parseFloat(day[field]) || 0), 0) / data.length;

        const recentCTR = calculateAverage(recentData, 'ctr');
        const previousCTR = calculateAverage(previousData, 'ctr');
        const recentCPM = calculateAverage(recentData, 'cpm');
        const previousCPM = calculateAverage(previousData, 'cpm');
        const recentConvRate = calculateAverage(recentData, 'conversion_rate');
        const previousConvRate = calculateAverage(previousData, 'conversion_rate');

        // Calculate percent changes
        const ctrChange = ((recentCTR - previousCTR) / previousCTR) * 100;
        const cpmChange = ((recentCPM - previousCPM) / previousCPM) * 100;
        const conversionRateChange = ((recentConvRate - previousConvRate) / previousConvRate) * 100;

        // Detect fatigue
        const hasFatigue = ctrChange < -10 || cpmChange > 15 || conversionRateChange < -10;

        setFatigueStatus({
          status: hasFatigue ? 'fatigue-detected' : 'refresh-soon',
          message: hasFatigue 
            ? 'Creative fatigue detected - consider refreshing'
            : 'Creative running for 7+ days - monitor performance',
          icon: hasFatigue ? '⚠️' : '🔄',
          metrics: {
            ctrChange,
            cpmChange,
            conversionRateChange
          }
        });
      } catch (err: any) {
        console.error('Error checking creative fatigue:', err);
        setError(err.message || 'Failed to check creative fatigue');
      } finally {
        setIsLoading(false);
      }
    };

    checkFatigue();
  }, [itemId, creationDate]);

  return { fatigueStatus, isLoading, error };
};
