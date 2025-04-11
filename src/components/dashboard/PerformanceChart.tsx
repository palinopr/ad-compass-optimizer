
import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data - in a real application, this would come from your API
const data = [
  { date: 'Day 1', spend: 120, impressions: 1200, clicks: 82, conversions: 5 },
  { date: 'Day 2', spend: 150, impressions: 1500, clicks: 95, conversions: 7 },
  { date: 'Day 3', spend: 180, impressions: 1700, clicks: 110, conversions: 9 },
  { date: 'Day 4', spend: 170, impressions: 1600, clicks: 105, conversions: 8 },
  { date: 'Day 5', spend: 200, impressions: 1900, clicks: 130, conversions: 11 },
  { date: 'Day 6', spend: 220, impressions: 2100, clicks: 140, conversions: 13 },
  { date: 'Day 7', spend: 250, impressions: 2400, clicks: 160, conversions: 15 },
];

const PerformanceChart = () => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Campaign Performance</h3>
        <Tabs defaultValue="7days">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="7days">7 days</TabsTrigger>
            <TabsTrigger value="30days">30 days</TabsTrigger>
            <TabsTrigger value="90days">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="spend" 
              stroke="#1877F2" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="clicks" 
              stroke="#4CAF50" 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="conversions" 
              stroke="#FF5722" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PerformanceChart;
