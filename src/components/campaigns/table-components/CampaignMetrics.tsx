
import React from 'react';

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
    return results || '-';
  };
  
  const getCpaDisplay = (): string => {
    return insights?.cpa ? formatCurrency(insights.cpa) : '-';
  };

  return (
    <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
      <div>{getBudgetDisplay()}</div>
      <div>{getSpendDisplay()}</div>
      <div>{getResultsDisplay()}</div>
      <div>{getCpaDisplay()}</div>
      <div>
        {insights?.roas && insights.roas !== '-' ? (
          <span className={parseFloat(insights.roas) >= 4 ? 'text-green-600 font-medium' : ''}>
            {insights.roas}
          </span>
        ) : '-'}
      </div>
    </div>
  );
};

export default CampaignMetrics;

