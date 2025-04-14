
import React from 'react';
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ImpressionsChartProps {
  data: any[];
}

const ImpressionsChart = ({ data }: ImpressionsChartProps) => {
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
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-4">Impressions Trend</h3>
      <ChartContainer className="h-64" config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
  );
};

export default ImpressionsChart;
