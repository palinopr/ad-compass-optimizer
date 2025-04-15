
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
    clicks?: string;
    impressions?: string;
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
  // Log detailed metrics data for debugging
  React.useEffect(() => {
    const availableData = {
      budget: getBudgetDisplay(),
      spend: getSpendDisplay(),
      results: getResultsDisplay(),
      cpa: getCpaDisplay(),
      roas: getRoasDisplay(),
      hasInsights: !!insights,
      hasExtraStats: !!extraStats
    };
    
    // Only log if there's a potential issue with the data
    if (availableData.spend === '-' || availableData.results === '-' || 
        availableData.cpa === '-' || availableData.roas === '-') {
      console.log('[CAMPAIGN METRICS] Available data for rendering:', availableData);
      
      // Log details of what we received
      if (insights) {
        console.log('[CAMPAIGN METRICS] Raw insights:', {
          spend: insights.spend || 'missing',
          cpa: insights.cpa || 'missing', 
          roas: insights.roas || 'missing'
        });
      }
      
      if (extraStats) {
        console.log('[CAMPAIGN METRICS] Extra stats:', extraStats);
      }
    }
  }, [budget, dailyBudget, lifetimeBudget, spend, results, extraStats, insights]);

  const getBudgetDisplay = (): string => {
    if (budget) return formatCurrency(budget);
    if (dailyBudget) return formatCurrency(dailyBudget) + '/day';
    if (lifetimeBudget) return formatCurrency(lifetimeBudget) + ' (lifetime)';
    return '-';
  };
  
  const getSpendDisplay = (): string => {
    // Check all possible sources for spend data in order of priority
    const spendValue = spend || insights?.spend || extraStats?.spend;
    return formatCurrency(spendValue);
  };

  const getResultsDisplay = (): string => {
    // Prioritize extraStats.results if available and valid
    if (extraStats?.results && extraStats.results !== '-') {
      return extraStats.results;
    }
    return results || '-';
  };
  
  const getCpaDisplay = (): string => {
    // Use insights.cpa directly if available, then fall back to extraStats
    if (insights?.cpa && insights.cpa !== '-') {
      return formatCurrency(insights.cpa);
    }
    if (extraStats?.cpa && extraStats.cpa !== '-') {
      return formatCurrency(extraStats.cpa);
    }
    return '-';
  };
  
  const getRoasDisplay = (): string => {
    // Use insights.roas directly if available, then fall back to extraStats
    if (insights?.roas && insights.roas !== '-') {
      return insights.roas;
    }
    if (extraStats?.roas && extraStats.roas !== '-') {
      return extraStats.roas;
    }
    return '-';
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
