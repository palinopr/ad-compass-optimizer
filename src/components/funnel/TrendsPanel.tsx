import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from 'lucide-react';
import BudgetTracker from './BudgetTracker';
import { useBudgetTracker } from '@/hooks/funnel/useBudgetTracker';
import PerformanceAlerts from './PerformanceAlerts';
import SpendChart from './charts/SpendChart';
import CtrChart from './charts/CtrChart';
import ImpressionsChart from './charts/ImpressionsChart';
import RecommendationsBox from './RecommendationsBox';
import { useRecommendations } from '@/hooks/funnel/useRecommendations';
import CreativeRotationBox from './CreativeRotationBox';

interface TrendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  itemType: 'campaign' | 'adset';
  insights: any | null;
  isLoading: boolean;
  itemData?: any;
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({
  isOpen,
  onClose,
  itemName,
  itemId,
  itemType,
  insights,
  isLoading,
  itemData
}) => {
  const { budgetStatus, isLoading: isBudgetLoading, error: budgetError, trackBudget } = useBudgetTracker();
  const { recommendations, isLoading: isRecsLoading, error: recsError } = useRecommendations(
    itemId,
    itemData?.target_cpa ? budgetStatus : null,
    itemData?.creatives,
    insights
  );
  
  useEffect(() => {
    if (isOpen && itemId && itemData) {
      trackBudget(
        itemId,
        itemType,
        itemData.start_time,
        itemData.end_time,
        itemData.budget,
        itemData.daily_budget ? parseFloat(itemData.daily_budget) : undefined,
        itemData.lifetime_budget ? parseFloat(itemData.lifetime_budget) : undefined
      );
    }
  }, [isOpen, itemId, itemType, itemData, trackBudget]);

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{itemType === 'campaign' ? 'Campaign' : 'Ad Set'}: {itemName}</SheetTitle>
        </SheetHeader>

        <PerformanceAlerts 
          itemId={itemId}
          creationDate={itemData?.start_time}
          targetCPA={itemData?.target_cpa}
        />

        <RecommendationsBox 
          recommendations={recommendations}
          isLoading={isRecsLoading}
          error={recsError}
        />

        <CreativeRotationBox 
          creatives={itemData?.creatives || []}
          creationDates={itemData?.creative_dates}
        />

        <BudgetTracker 
          budgetStatus={budgetStatus} 
          isLoading={isBudgetLoading} 
          error={budgetError} 
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64 mt-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : insights ? (
          <div className="space-y-6 py-6">
            <SpendChart data={insights.spend} />
            <CtrChart data={insights.ctr} />
            <ImpressionsChart data={insights.impressions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground mt-6">
            No insights data available
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TrendsPanel;
