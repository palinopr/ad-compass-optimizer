
import { useState, useEffect } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';

export type CreativePerformance = {
  id: string;
  age: number;
  metrics: {
    ctr: number;
    conversionRate: number;
    recentTrend: 'improving' | 'declining' | 'stable';
  };
  status: 'fresh' | 'aging' | 'needs-refresh';
  isTopPerformer: boolean;
};

export const useCreativeRotation = (creatives: any[] = [], creationDates?: { [key: string]: string }) => {
  const [performanceData, setPerformanceData] = useState<CreativePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeCreatives = async () => {
      if (!creatives?.length) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const token = metaAuthService.getAccessToken();
        if (!token) throw new Error('No access token available');

        const results: CreativePerformance[] = await Promise.all(
          creatives.map(async (creative) => {
            const creationDate = creationDates?.[creative.id] || creative.created_time;
            const ageInDays = Math.floor(
              (Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Fetch last 14 days of performance data
            const response = await MetaInsightsService.fetchInsights(token, creative.id, {
              datePreset: 'last_14d',
              fields: ['ctr', 'conversion_rate']
            });

            const recentData = response.data.slice(0, 7);
            const previousData = response.data.slice(7);

            // Calculate metrics
            const calculateAverage = (data: any[], field: string) => 
              data.reduce((sum, day) => sum + (parseFloat(day[field]) || 0), 0) / data.length;

            const recentCTR = calculateAverage(recentData, 'ctr');
            const previousCTR = calculateAverage(previousData, 'ctr');
            const recentConvRate = calculateAverage(recentData, 'conversion_rate');
            const previousConvRate = calculateAverage(previousData, 'conversion_rate');

            // Determine performance trend
            const ctrChange = ((recentCTR - previousCTR) / previousCTR) * 100;
            const convRateChange = ((recentConvRate - previousConvRate) / previousConvRate) * 100;
            
            const trend = 
              (ctrChange > 5 && convRateChange > 5) ? 'improving' :
              (ctrChange < -10 || convRateChange < -10) ? 'declining' : 
              'stable';

            // Determine status based on age and performance
            const status = 
              ageInDays < 7 ? 'fresh' :
              (ageInDays >= 7 && trend === 'declining') ? 'needs-refresh' :
              'aging';

            return {
              id: creative.id,
              age: ageInDays,
              metrics: {
                ctr: recentCTR,
                conversionRate: recentConvRate,
                recentTrend: trend,
              },
              status,
              isTopPerformer: trend === 'improving' && recentCTR > 0.02 // 2% CTR threshold
            };
          })
        );

        setPerformanceData(results);
      } catch (err: any) {
        console.error('Error analyzing creatives:', err);
        setError(err.message || 'Failed to analyze creative performance');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeCreatives();
  }, [creatives, creationDates]);

  return { performanceData, isLoading, error };
};
