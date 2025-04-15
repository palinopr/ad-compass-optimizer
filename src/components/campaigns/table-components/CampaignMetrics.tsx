
import React from 'react';
import { CampaignExtraStats } from '@/hooks/campaigns/fetch-utils/campaignInsightsFetcher';

const formatCurrency = (value: string | undefined): string => {
  if (!value || value === '-') return '-';
  if (value.startsWith('$')) return value;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

interface CampaignMetricsProps {
  budget?: string;
  dailyBudget?: string;
  lifetimeBudget?: string;
  spend?: string;
  results?: string;
  extraStats?: CampaignExtraStats;
  insights?: {
    spend?: string;
    cpa?: string;
    roas?: string;
  };
}

const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ 
  budget,
  dailyBudget,
  lifetimeBudget,
  spend,
  results,
  extraStats,
  insights
}) => {
  const getBudgetDisplay = (): string => {
    if (budget) return formatCurrency(budget);
    if (dailyBudget) return formatCurrency(dailyBudget) + '/day';
    if (lifetimeBudget) return formatCurrency(lifetimeBudget) + ' (lifetime)';
    return '-';
  };
  
  const getSpendDisplay = (): string => {
    const spendValue = spend || insights?.spend;
    return formatCurrency(spendValue);
  };

  const getResultsDisplay = (): string => {
    // Prioritize extraStats.results if available
    if (extraStats?.results && extraStats.results !== '-') {
      return extraStats.results;
    }
    return results || '-';
  };
  
  const getCpaDisplay = (): string => {
    // Prioritize extraStats.cpa if available
    if (extraStats?.cpa && extraStats.cpa !== '-') {
      return formatCurrency(extraStats.cpa);
    }
    return insights?.cpa ? formatCurrency(insights.cpa) : '-';
  };
  
  const getRoasDisplay = (): string => {
    // Prioritize extraStats.roas if available
    if (extraStats?.roas && extraStats.roas !== '-') {
      return extraStats.roas;
    }
    return insights?.roas || '-';
  };

  return (
    <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
      <div>{getBudgetDisplay()}</div>
      <div>{getSpendDisplay()}</div>
      <div>{getResultsDisplay()}</div>
      <div>{getCpaDisplay()}</div>
      <div>
        {getRoasDisplay() !== '-' ? (
          <span className={parseFloat(getRoasDisplay()) >= 4 ? 'text-green-600 font-medium' : ''}>
            {getRoasDisplay()}
          </span>
        ) : '-'}
      </div>
    </div>
  );
};

export default CampaignMetrics;
