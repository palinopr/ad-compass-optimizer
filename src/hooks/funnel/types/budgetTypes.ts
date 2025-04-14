
export interface BudgetStatus {
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

export interface BudgetAnalysisParams {
  startDate?: string;
  endDate?: string;
  budget?: number;
  dailyBudget?: number;
  lifetimeBudget?: number;
  itemId: string;
  itemType: 'campaign' | 'adset';
}
