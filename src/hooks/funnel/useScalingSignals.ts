
import { useState, useEffect } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';

export type ScalingSignal = {
  status: 'eligible' | 'slow-scale' | 'watch' | 'pause';
  message: string;
  icon: string;
  details?: {
    daysUnderTarget?: number;
    cpaChange?: number;
    lastIncreaseDate?: string;
  };
};

export const useScalingSignals = (itemId: string, targetCPA?: number) => {
  const [scalingSignal, setScalingSignal] = useState<ScalingSignal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeScaling = async () => {
      if (!itemId || !targetCPA) {
        setScalingSignal(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = metaAuthService.getAccessToken();
        if (!token) throw new Error('No access token available');

        // Fetch last 7 days of performance data
        const response = await MetaInsightsService.fetchInsights(token, itemId, {
          datePreset: 'last_7d',
          fields: ['spend', 'cpa', 'actions']
        });

        const data = response.data;
        if (!data || data.length === 0) throw new Error('No data available');

        // Calculate metrics
        const cpaTrend = data.map(day => parseFloat(day.cpa) || 0);
        const conversionVolume = data.map(day => parseInt(day.actions) || 0);
        
        // Check for stable under-target CPA
        const daysUnderTarget = cpaTrend.filter(cpa => cpa < targetCPA * 0.9).length;
        const isStable = calculateStability(cpaTrend) < 0.2; // 20% variation threshold
        
        // Check post-increase CPA trend
        const recentCPAChange = ((cpaTrend[cpaTrend.length - 1] - cpaTrend[0]) / cpaTrend[0]) * 100;
        
        // Analyze conversion volume stability
        const volumeStability = calculateStability(conversionVolume);

        // Determine scaling signal
        let signal: ScalingSignal;

        if (daysUnderTarget >= 3 && isStable) {
          signal = {
            status: 'eligible',
            message: 'Eligible to scale - CPA stable under target',
            icon: '✅',
            details: { daysUnderTarget }
          };
        } else if (daysUnderTarget >= 2 && volumeStability < 0.3) {
          signal = {
            status: 'slow-scale',
            message: 'Scale slowly - Increase budget by 15% every 2-3 days',
            icon: '⬆️',
            details: { daysUnderTarget }
          };
        } else if (recentCPAChange > 30) {
          signal = {
            status: 'pause',
            message: 'Pause scaling - CPA increased significantly',
            icon: '🔺',
            details: { cpaChange: recentCPAChange }
          };
        } else {
          signal = {
            status: 'watch',
            message: 'Monitor performance before scaling',
            icon: '⚠️',
            details: { cpaChange: recentCPAChange }
          };
        }

        setScalingSignal(signal);
      } catch (err: any) {
        console.error('Error analyzing scaling signals:', err);
        setError(err.message || 'Failed to analyze scaling signals');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeScaling();
  }, [itemId, targetCPA]);

  return { scalingSignal, isLoading, error };
};

// Helper function to calculate coefficient of variation (stability measure)
const calculateStability = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
};
