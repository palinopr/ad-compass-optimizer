
import { format, addDays } from 'date-fns';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { BudgetStatus } from '../types/budgetTypes';
import { calculateStdDeviation, isTrendIncreasing } from '../utils/budgetCalculations';

export const calculateOngoingBudget = async (
  campaignId: string,
  dailyBudget?: number
): Promise<BudgetStatus> => {
  try {
    const token = metaAuthService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

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
    
    const dailySpends = response.data.map(day => parseFloat(day.spend || '0'));
    const avgDailySpend = dailySpends.reduce((sum, spend) => sum + spend, 0) / dailySpends.length;
    const spendToDate = dailySpends.reduce((sum, spend) => sum + spend, 0);
    
    const projectionDate = addDays(new Date(), 30);
    const projectedSpend = avgDailySpend * 30;
    
    const stdDeviation = calculateStdDeviation(dailySpends);
    const coefficientOfVariation = (stdDeviation / avgDailySpend) * 100;
    
    let status: 'aligned' | 'behind' | 'over-accelerated' = 'aligned';
    let statusIcon = '✅';
    let message = '';
    
    if (coefficientOfVariation > 50) {
      status = 'over-accelerated';
      statusIcon = '⚠️';
      message = `Spend pattern is erratic with high daily variation (${coefficientOfVariation.toFixed(1)}%). Review campaign settings.`;
    } else if (avgDailySpend < 0.5 && dailyBudget && dailyBudget > 0) {
      status = 'behind';
      statusIcon = '⚠️';
      message = `Daily spend is significantly below budget. Average daily spend: $${avgDailySpend.toFixed(2)} vs budget: $${dailyBudget.toFixed(2)}.`;
    } else if (isTrendIncreasing(dailySpends) && dailySpends[dailySpends.length - 1] > dailySpends[0] * 1.5) {
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
