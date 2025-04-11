
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, TrendingUp } from 'lucide-react';

// Sample data - in a real application, this would come from your API
const weeklyData = [
  { date: 'Mon', spend: 120, impressions: 1200, clicks: 82, conversions: 5 },
  { date: 'Tue', spend: 150, impressions: 1500, clicks: 95, conversions: 7 },
  { date: 'Wed', spend: 180, impressions: 1700, clicks: 110, conversions: 9 },
  { date: 'Thu', spend: 170, impressions: 1600, clicks: 105, conversions: 8 },
  { date: 'Fri', spend: 200, impressions: 1900, clicks: 130, conversions: 11 },
  { date: 'Sat', spend: 220, impressions: 2100, clicks: 140, conversions: 13 },
  { date: 'Sun', spend: 250, impressions: 2400, clicks: 160, conversions: 15 },
];

const monthlyData = [
  { date: 'Week 1', spend: 980, impressions: 9800, clicks: 650, conversions: 42 },
  { date: 'Week 2', spend: 1050, impressions: 10500, clicks: 720, conversions: 51 },
  { date: 'Week 3', spend: 1200, impressions: 12000, clicks: 830, conversions: 65 },
  { date: 'Week 4', spend: 1350, impressions: 13500, clicks: 920, conversions: 78 },
];

const chartConfig = {
  spend: {
    label: "Spend ($)",
    theme: {
      light: "#1877F2",
      dark: "#60a5fa"
    }
  },
  clicks: {
    label: "Clicks",
    theme: {
      light: "#4CAF50",
      dark: "#86efac"
    }
  },
  conversions: {
    label: "Conversions",
    theme: {
      light: "#FF5722",
      dark: "#fdba74"
    }
  },
  impressions: {
    label: "Impressions",
    theme: {
      light: "#9b87f5",
      dark: "#c4b5fd"
    }
  }
};

const PerformanceChart = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium">
            <TrendingUp className="w-5 h-5 mr-2" />
            Campaign Performance
          </CardTitle>
          <Tabs defaultValue="weekly" className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsContent value="weekly" className="h-[300px] mt-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--color-spend)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="var(--color-conversions)"
                  />
                  <Line
                    type="monotone"
                    dataKey="impressions" 
                    stroke="var(--color-impressions)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="monthly" className="h-[300px] mt-0">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--color-spend)"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-clicks)"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="var(--color-conversions)"
                  />
                  <Line
                    type="monotone"
                    dataKey="impressions" 
                    stroke="var(--color-impressions)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
