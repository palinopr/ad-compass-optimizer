
import React from 'react';
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CtrChartProps {
  data: any[];
}

const CtrChart = ({ data }: CtrChartProps) => {
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const renderCtrTooltip = (props: any) => {
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

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">CTR Trend</h3>
      <ChartContainer className="h-64" config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatPercentage(Number(value))} />
            <Tooltip content={renderCtrTooltip} />
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
  );
};

export default CtrChart;
