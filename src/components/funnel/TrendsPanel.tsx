import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import BudgetTracker from './BudgetTracker';
import { useBudgetTracker } from '@/hooks/funnel/useBudgetTracker';
import PerformanceAlerts from './PerformanceAlerts';

interface TrendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  itemType: 'campaign' | 'adset';
  insights: any | null;
  isLoading: boolean;
  itemData?: any; // Campaign or AdSet data with budget information
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

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (!isOpen) return null;

  const renderSpendTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <div className="font-medium">Spend</div>
        <div>{formatValue(Number(props.payload[0].value))}</div>
      </div>
    );
  };

  const renderCTRTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <div className="font-medium">CTR</div>
        <div>{formatPercentage(Number(props.payload[0].value))}</div>
      </div>
    );
  };

  const renderImpressionsTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) {
      return null;
    }
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-2">
        <div className="font-medium">Impressions</div>
        <div>{Number(props.payload[0].value).toLocaleString()}</div>
      </div>
    );
  };

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
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">Spend Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.spend}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatValue(Number(value))} />
                    <Tooltip content={renderSpendTooltip} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">CTR Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.ctr}>
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatPercentage(Number(value))} />
                    <Tooltip content={renderCTRTooltip} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">Impressions Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.impressions}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={renderImpressionsTooltip} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
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
