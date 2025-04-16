
import React from 'react';
import { SingleMetric } from './metrics/SingleMetric';
import { RoasMetric } from './metrics/RoasMetric';
import { formatCurrency } from './metrics/utils/formatters';
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';

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
  isBlocked?: boolean;
}

const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ 
  budget,
  dailyBudget,
  lifetimeBudget,
  spend,
  results,
  extraStats,
  insights,
  isBlocked = false
}) => {
  React.useEffect(() => {
    // Enhanced debugging: Log available metrics data
    const availableData = {
      budget: getBudgetDisplay(),
      spend: getSpendDisplay(),
      results: getResultsDisplay(),
      cpa: getCpaDisplay(),
      roas: getRoasDisplay(),
      hasInsights: !!insights,
      hasExtraStats: !!extraStats
    };
    
    console.log('[CAMPAIGN METRICS] Rendering metrics with:', availableData);
    
    if (insights && (insights.spend || insights.cpa || insights.roas)) {
      localStorage.setItem('has_valid_campaign_insights', 'true');
    }
  }, [budget, dailyBudget, lifetimeBudget, spend, results, extraStats, insights]);

  const getBudgetDisplay = (): string => {
    if (budget) return formatCurrency(budget);
    if (dailyBudget) return formatCurrency(dailyBudget) + '/day';
    if (lifetimeBudget) return formatCurrency(lifetimeBudget) + ' (lifetime)';
    return '-';
  };
  
  const getSpendDisplay = (): string => {
    const spendValue = spend || insights?.spend || extraStats?.spend;
    return spendValue ? formatCurrency(spendValue) : '-';
  };

  const getResultsDisplay = (): string => {
    if (extraStats?.results && extraStats.results !== '-') {
      return extraStats.results;
    }
    return results || '-';
  };
  
  const getCpaDisplay = (): string => {
    if (insights?.cpa && insights.cpa !== '-') {
      return formatCurrency(insights.cpa);
    }
    if (extraStats?.cpa && extraStats.cpa !== '-') {
      return formatCurrency(extraStats.cpa);
    }
    return '-';
  };
  
  const getRoasDisplay = (): string => {
    if (insights?.roas && insights.roas !== '-') {
      return insights.roas;
    }
    if (extraStats?.roas && extraStats.roas !== '-') {
      return extraStats.roas;
    }
    return '-';
  };

  return (
    <div className="grid grid-cols-5 gap-4 text-sm">
      <SingleMetric value={getBudgetDisplay()} isBlocked={isBlocked} />
      <SingleMetric value={getSpendDisplay()} isBlocked={isBlocked} />
      <SingleMetric value={getResultsDisplay()} isBlocked={isBlocked} />
      <SingleMetric value={getCpaDisplay()} isBlocked={isBlocked} />
      <RoasMetric value={getRoasDisplay()} isBlocked={isBlocked} />
    </div>
  );
};

export default CampaignMetrics;
