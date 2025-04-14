
import React from 'react';
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendChartProps {
  data: any[];
}

const SpendChart = ({ data }: SpendChartProps) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

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

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Spend Trend</h3>
      <ChartContainer className="h-64" config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
  );
};

export default SpendChart;
