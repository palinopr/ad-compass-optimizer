
import { format, differenceInDays, parseISO } from 'date-fns';
import { BudgetStatus } from '../types/budgetTypes';

export const calculateTimeBasedBudget = (
  startDate: string, 
  endDate: string, 
  budget: number,
  spendToDate: number
): BudgetStatus => {
  const today = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  const remainingDuration = differenceInDays(end, today);
  
  // Calculate which phase we're in
  let minExpectedPercentage = 0;
  let maxExpectedPercentage = 0;
  let phaseDescription = '';
  
  if (remainingDuration >= 56) {
    minExpectedPercentage = 15;
    maxExpectedPercentage = 20;
    phaseDescription = 'initial launch phase (8+ weeks out)';
  } else if (remainingDuration >= 28) {
    minExpectedPercentage = 30;
    maxExpectedPercentage = 40;
    phaseDescription = 'growth phase (4-8 weeks out)';
  } else if (remainingDuration >= 14) {
    minExpectedPercentage = 25;
    maxExpectedPercentage = 30;
    phaseDescription = 'optimization phase (2-4 weeks out)';
  } else {
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

export const calculateStdDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

export const isTrendIncreasing = (values: number[]): boolean => {
  if (values.length < 5) return false;
  
  const halfPoint = Math.floor(values.length / 2);
  const firstHalfAvg = values.slice(0, halfPoint).reduce((sum, val) => sum + val, 0) / halfPoint;
  const secondHalfAvg = values.slice(halfPoint).reduce((sum, val) => sum + val, 0) / (values.length - halfPoint);
  
  return secondHalfAvg > firstHalfAvg * 1.2; // 20% increase threshold
};
