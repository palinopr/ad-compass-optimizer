
import { useState, useEffect } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';

export type Recommendation = {
  id: string;
  message: string;
  icon: string;
  type: 'success' | 'warning' | 'info';
  priority: number;
};

export const useRecommendations = (
  itemId: string,
  cpaStatus: any,
  fatigueStatus: any,
  insights: any
) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePerformance = async () => {
      if (!itemId) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = metaAuthService.getAccessToken();
        if (!token) throw new Error('No access token available');

        const newRecommendations: Recommendation[] = [];

        // Check CPA performance for budget recommendations
        if (cpaStatus?.daysLow >= 2) {
          newRecommendations.push({
            id: 'budget-increase',
            message: 'Consider increasing budget by 15% - CPA consistently below target',
            icon: '📈',
            type: 'success',
            priority: 1
          });
        }

        if (cpaStatus?.status === 'high' && cpaStatus?.daysHigh >= 2) {
          newRecommendations.push({
            id: 'pause-creatives',
            message: 'Consider pausing underperforming creatives - CPA above target',
            icon: '⚠️',
            type: 'warning',
            priority: 2
          });
        }

        // Check creative fatigue status
        if (fatigueStatus?.fatigueCount >= 2) {
          newRecommendations.push({
            id: 'refresh-creatives',
            message: 'Creative refresh recommended - Multiple ads showing fatigue',
            icon: '🔄',
            type: 'warning',
            priority: 1
          });
        }

        // Check CTR vs CPA trend
        if (insights) {
          const recentCTR = insights.ctr?.slice(-7) || [];
          const recentCPA = insights.spend?.slice(-7).map((s: any, i: number) => 
            s.value / (insights.conversions?.[i]?.value || 1)
          ) || [];

          const ctrTrend = recentCTR.length > 1 ? 
            recentCTR[recentCTR.length - 1].value - recentCTR[0].value : 0;
          const cpaTrend = recentCPA.length > 1 ? 
            recentCPA[recentCPA.length - 1] - recentCPA[0] : 0;

          if (ctrTrend > 0 && cpaTrend > 0) {
            newRecommendations.push({
              id: 'review-landing',
              message: 'Review landing page/pixel - CTR improving but CPA rising',
              icon: '👀',
              type: 'info',
              priority: 3
            });
          }
        }

        setRecommendations(newRecommendations.sort((a, b) => a.priority - b.priority));
      } catch (err: any) {
        console.error('Error analyzing performance:', err);
        setError(err.message || 'Failed to analyze performance');
      } finally {
        setIsLoading(false);
      }
    };

    analyzePerformance();
  }, [itemId, cpaStatus, fatigueStatus, insights]);

  return { recommendations, isLoading, error };
};
