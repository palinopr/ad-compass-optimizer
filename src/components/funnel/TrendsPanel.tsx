
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, TooltipProps } from 'recharts';
import { Loader2 } from 'lucide-react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface TrendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  itemType: 'campaign' | 'adset';
  insights: any | null;
  isLoading: boolean;
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({
  isOpen,
  onClose,
  itemName,
  itemType,
  insights,
  isLoading
}) => {
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

  // Custom tooltip function for spend data
  const renderSpendTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <div className="font-medium">Spend</div>
          <div>{formatValue(Number(payload[0].value))}</div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip function for CTR data
  const renderCTRTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <div className="font-medium">CTR</div>
          <div>{formatPercentage(Number(payload[0].value))}</div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip function for impressions data
  const renderImpressionsTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <div className="font-medium">Impressions</div>
          <div>{Number(payload[0].value).toLocaleString()}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{itemType === 'campaign' ? 'Campaign' : 'Ad Set'}: {itemName}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : insights ? (
          <div className="space-y-6 py-6">
            {/* Spend Trend */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">Spend Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <LineChart data={insights.spend}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatValue(Number(value))} />
                  <ChartTooltip content={renderSpendTooltip} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </Card>

            {/* CTR Trend */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">CTR Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <LineChart data={insights.ctr}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatPercentage(Number(value))} />
                  <ChartTooltip content={renderCTRTooltip} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </Card>

            {/* Impressions Trend */}
            <Card className="p-4">
              <h3 className="text-sm font-medium mb-4">Impressions Trend</h3>
              <ChartContainer className="h-64" config={{}}>
                <LineChart data={insights.impressions}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={renderImpressionsTooltip} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No insights data available
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TrendsPanel;
