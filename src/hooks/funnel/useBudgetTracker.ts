
import { useState, useCallback } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

interface BudgetStatus {
  status: 'aligned' | 'behind' | 'over-accelerated' | 'unknown';
  statusIcon: string;
  message: string;
  spendToDate: number;
  spentPercentage: number;
  expectedMinPercentage?: number;
  expectedMaxPercentage?: number;
  projectedSpend?: number;
  projectedDate?: string;
}

export const useBudgetTracker = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTimeBasedBudget = (
    startDate: string, 
    endDate: string, 
    budget: number,
    spendToDate: number
  ): BudgetStatus => {
    const today = new Date();
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const totalDuration = differenceInDays(end, start);
    const elapsedDuration = differenceInDays(today, start);
    const remainingDuration = differenceInDays(end, today);
    
    // Calculate which phase we're in
    let minExpectedPercentage = 0;
    let maxExpectedPercentage = 0;
    let phaseDescription = '';
    
    if (remainingDuration >= 56) { // 8+ weeks out
      minExpectedPercentage = 15;
      maxExpectedPercentage = 20;
      phaseDescription = 'initial launch phase (8+ weeks out)';
    } else if (remainingDuration >= 28) { // 4-8 weeks
      minExpectedPercentage = 30;
      maxExpectedPercentage = 40;
      phaseDescription = 'growth phase (4-8 weeks out)';
    } else if (remainingDuration >= 14) { // 2-4 weeks
      minExpectedPercentage = 25;
      maxExpectedPercentage = 30;
      phaseDescription = 'optimization phase (2-4 weeks out)';
    } else { // final 2 weeks
      minExpectedPercentage = 15;
      maxExpectedPercentage = 20;
      phaseDescription = 'final phase (under 2 weeks remaining)';
    }
    
    const spentPercentage = (spendToDate / budget) * 100;
    
    // Determine status
    let status: 'aligned' | 'behind' | 'over-accelerated' = 'aligned';
    let statusIcon = '✅';
    let message = '';
    
    if (spentPercentage < minExpectedPercentage) {
      status = 'behind';
      statusIcon = '⚠️';
      message = `Budget spend is behind target for ${phaseDescription}. Currently at ${spentPercentage.toFixed(1)}% vs expected ${minExpectedPercentage}%-${maxExpectedPercentage}%.`;
    } else if (spentPercentage > maxExpectedPercentage) {
      status = 'over-accelerated';
      statusIcon = '🔺';
      message = `Budget spend is accelerating too quickly for ${phaseDescription}. Currently at ${spentPercentage.toFixed(1)}% vs expected ${minExpectedPercentage}%-${maxExpectedPercentage}%.`;
    } else {
      message = `Budget spend is on track for ${phaseDescription}. Currently at ${spentPercentage.toFixed(1)}% within expected ${minExpectedPercentage}%-${maxExpectedPercentage}%.`;
    }
    
    return {
      status,
      statusIcon,
      message,
      spendToDate,
      spentPercentage,
      expectedMinPercentage: minExpectedPercentage,
      expectedMaxPercentage: maxExpectedPercentage
    };
  };

  const calculateOngoingBudget = async (
    campaignId: string,
    dailyBudget?: number
  ): Promise<BudgetStatus> => {
    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Fetch last 14 days of insights
      const options = {
        datePreset: 'last_14d' as const,
        fields: ['spend', 'date_start'],
      };

      const response = await MetaInsightsService.fetchCampaignInsights(token, campaignId, options);
      
      if (!response.data || response.data.length === 0) {
        return {
          status: 'unknown',
          statusIcon: '❓',
          message: 'Not enough data to calculate budget projection.',
          spendToDate: 0,
          spentPercentage: 0
        };
      }
      
      // Calculate average daily spend
      const dailySpends = response.data.map(day => parseFloat(day.spend || '0'));
      const avgDailySpend = dailySpends.reduce((sum, spend) => sum + spend, 0) / dailySpends.length;
      
      // Calculate total spend to date from the insights
      const spendToDate = dailySpends.reduce((sum, spend) => sum + spend, 0);
      
      // Calculate projection for 30 days from now
      const projectionDate = addDays(new Date(), 30);
      const projectedSpend = avgDailySpend * 30;
      
      // Analyze spend pattern to detect anomalies
      const stdDeviation = calculateStdDeviation(dailySpends);
      const coefficientOfVariation = (stdDeviation / avgDailySpend) * 100;
      
      let status: 'aligned' | 'behind' | 'over-accelerated' = 'aligned';
      let statusIcon = '✅';
      let message = '';
      
      if (coefficientOfVariation > 50) {
        // High variation indicates erratic spending
        status = 'over-accelerated';
        statusIcon = '⚠️';
        message = `Spend pattern is erratic with high daily variation (${coefficientOfVariation.toFixed(1)}%). Review campaign settings.`;
      } else if (avgDailySpend < 0.5 && dailyBudget && dailyBudget > 0) {
        // Very low spend compared to budget indicates potential issues
        status = 'behind';
        statusIcon = '⚠️';
        message = `Daily spend is significantly below budget. Average daily spend: $${avgDailySpend.toFixed(2)} vs budget: $${dailyBudget.toFixed(2)}.`;
      } else if (isTrendIncreasing(dailySpends) && dailySpends[dailySpends.length - 1] > dailySpends[0] * 1.5) {
        // Spend is increasing significantly
        status = 'over-accelerated';
        statusIcon = '🔺';
        message = `Spend is rapidly increasing (${((dailySpends[dailySpends.length - 1] / dailySpends[0] - 1) * 100).toFixed(1)}% increase over period). Monitor closely.`;
      } else {
        message = `Based on current trend ($${avgDailySpend.toFixed(2)}/day), you'll spend $${projectedSpend.toFixed(2)} by ${format(projectionDate, 'MMM d, yyyy')}.`;
      }
      
      return {
        status,
        statusIcon,
        message,
        spendToDate,
        spentPercentage: dailyBudget ? (avgDailySpend / dailyBudget) * 100 : 0,
        projectedSpend,
        projectedDate: format(projectionDate, 'MMM d, yyyy')
      };
    } catch (err: any) {
      console.error('Error calculating ongoing budget:', err);
      throw err;
    }
  };

  // Helper function to calculate standard deviation
  const calculateStdDeviation = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  };

  // Helper function to detect increasing trend
  const isTrendIncreasing = (values: number[]): boolean => {
    if (values.length < 5) return false;
    
    const halfPoint = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, halfPoint).reduce((sum, val) => sum + val, 0) / halfPoint;
    const secondHalfAvg = values.slice(halfPoint).reduce((sum, val) => sum + val, 0) / (values.length - halfPoint);
    
    return secondHalfAvg > firstHalfAvg * 1.2; // 20% increase threshold
  };

  const trackBudget = useCallback(async (
    itemId: string,
    itemType: 'campaign' | 'adset', 
    startTime?: string, 
    endTime?: string,
    budget?: number, 
    dailyBudget?: number,
    lifetimeBudget?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // First get the current spend
      const options = {
        datePreset: 'lifetime' as const,
        fields: ['spend'],
      };

      const response = itemType === 'campaign' 
        ? await MetaInsightsService.fetchCampaignInsights(token, itemId, options)
        : await MetaInsightsService.fetchAdSetInsights(token, itemId, options);
      
      if (!response.data || response.data.length === 0) {
        setBudgetStatus({
          status: 'unknown',
          statusIcon: '❓',
          message: 'No spend data available for this item.',
          spendToDate: 0,
          spentPercentage: 0
        });
        setIsLoading(false);
        return;
      }
      
      const spendToDate = parseFloat(response.data[0].spend || '0');
      
      let result: BudgetStatus;
      
      if (endTime) {
        // Option 1: Time-based budget tracking for campaigns with end date
        const totalBudget = budget || lifetimeBudget || 0;
        if (totalBudget <= 0) {
          result = {
            status: 'unknown',
            statusIcon: '❓',
            message: 'Cannot track budget - no budget amount specified.',
            spendToDate,
            spentPercentage: 0
          };
        } else {
          result = calculateTimeBasedBudget(startTime || new Date().toISOString(), endTime, totalBudget, spendToDate);
        }
      } else {
        // Option 2: Ongoing campaigns without end date
        try {
          result = await calculateOngoingBudget(itemId, dailyBudget);
        } catch (err) {
          result = {
            status: 'unknown',
            statusIcon: '❓',
            message: 'Error calculating budget projection.',
            spendToDate,
            spentPercentage: dailyBudget ? (spendToDate / dailyBudget) * 100 : 0
          };
        }
      }
      
      setBudgetStatus(result);
    } catch (err: any) {
      console.error('Error tracking budget:', err);
      setError(err.message || 'Failed to track budget');
      setBudgetStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    budgetStatus,
    isLoading,
    error,
    trackBudget
  };
};
