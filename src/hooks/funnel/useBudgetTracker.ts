
import { useState, useCallback } from 'react';
import { MetaInsightsService } from '@/services/api/MetaInsightsService';
import { metaAuthService } from '@/services/MetaAuthService';
import { BudgetStatus, BudgetAnalysisParams } from './types/budgetTypes';
import { calculateTimeBasedBudget } from './utils/budgetCalculations';
import { calculateOngoingBudget } from './services/ongoingBudgetService';

export const useBudgetTracker = () => {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackBudget = useCallback(async ({
    itemId,
    itemType,
    startDate,
    endDate,
    budget,
    dailyBudget,
    lifetimeBudget
  }: BudgetAnalysisParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

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
        return;
      }
      
      const spendToDate = parseFloat(response.data[0].spend || '0');
      
      let result: BudgetStatus;
      
      if (endDate) {
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
          result = calculateTimeBasedBudget(startDate || new Date().toISOString(), endDate, totalBudget, spendToDate);
        }
      } else {
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
