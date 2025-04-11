
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, TrendingUp, Ticket, DollarSign } from 'lucide-react';

// Sample data with event-specific metrics
const weeklyData = [
  { date: 'Mon', adSpend: 120, ticketSales: 12, revenue: 600, roas: 5.0 },
  { date: 'Tue', adSpend: 150, ticketSales: 15, revenue: 750, roas: 5.0 },
  { date: 'Wed', adSpend: 180, ticketSales: 22, revenue: 1100, roas: 6.1 },
  { date: 'Thu', adSpend: 170, ticketSales: 18, revenue: 900, roas: 5.3 },
  { date: 'Fri', adSpend: 200, ticketSales: 25, revenue: 1250, roas: 6.3 },
  { date: 'Sat', adSpend: 220, ticketSales: 29, revenue: 1450, roas: 6.6 },
  { date: 'Sun', adSpend: 250, ticketSales: 35, revenue: 1750, roas: 7.0 },
];

const monthlyData = [
  { date: 'Week 1', adSpend: 980, ticketSales: 98, revenue: 4900, roas: 5.0 },
  { date: 'Week 2', adSpend: 1050, ticketSales: 120, revenue: 6000, roas: 5.7 },
  { date: 'Week 3', adSpend: 1200, ticketSales: 150, revenue: 7500, roas: 6.3 },
  { date: 'Week 4', adSpend: 1350, ticketSales: 180, revenue: 9000, roas: 6.7 },
];

const chartConfig = {
  adSpend: {
    label: "Ad Spend ($)",
    theme: {
      light: "#FF5722",
      dark: "#fdba74"
    }
  },
  ticketSales: {
    label: "Ticket Sales",
    theme: {
      light: "#4CAF50",
      dark: "#86efac"
    }
  },
  revenue: {
    label: "Revenue ($)",
    theme: {
      light: "#1877F2",
      dark: "#60a5fa"
    }
  },
  roas: {
    label: "ROAS",
    theme: {
      light: "#9b87f5",
      dark: "#c4b5fd"
    }
  }
};

const PerformanceChart = () => {
  const [activeTab, setActiveTab] = useState("weekly");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center text-lg font-medium">
            <Ticket className="w-5 h-5 mr-2" />
            Event Marketing Performance
          </CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] mt-0">
          {activeTab === "weekly" && (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis width={50} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    type="monotone"
                    dataKey="adSpend"
                    stroke="var(--color-adSpend)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="ticketSales"
                    stroke="var(--color-ticketSales)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="roas" 
                    stroke="var(--color-roas)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
          {activeTab === "monthly" && (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis width={50} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    type="monotone"
                    dataKey="adSpend"
                    stroke="var(--color-adSpend)"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="ticketSales"
                    stroke="var(--color-ticketSales)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="roas" 
                    stroke="var(--color-roas)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500">Total Ad Spend</div>
            <div className="text-lg font-bold">$2,290</div>
            <div className="text-xs text-green-600 mt-1">+12% vs. last period</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500">Total Tickets</div>
            <div className="text-lg font-bold">156</div>
            <div className="text-xs text-green-600 mt-1">+18% vs. last period</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500">Total Revenue</div>
            <div className="text-lg font-bold">$7,800</div>
            <div className="text-xs text-green-600 mt-1">+22% vs. last period</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border">
            <div className="text-sm text-slate-500">Average ROAS</div>
            <div className="text-lg font-bold">6.0x</div>
            <div className="text-xs text-green-600 mt-1">+0.4 vs. last period</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
