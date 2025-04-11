
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Ticket } from 'lucide-react';

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

// Define the props interface for the CustomTooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const PerformanceChart = () => {
  const [activeTab, setActiveTab] = useState("weekly");
  const currentData = activeTab === "weekly" ? weeklyData : monthlyData;

  // Custom tooltip to control size and appearance
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md max-w-[200px]">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center mt-1">
              <span style={{ color: entry.color }} className="text-xs mr-2">
                {entry.name}:
              </span>
              <span className="font-mono text-xs font-medium">
                {entry.name === 'roas' ? `${entry.value}x` : entry.name === 'adSpend' || entry.name === 'revenue' ? `$${entry.value}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
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
        {/* Fixed height container for the chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={currentData}
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                width={40}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1877F2"
                strokeWidth={2}
                dot={{ fill: '#1877F2', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="adSpend"
                name="Ad Spend"
                stroke="#FF5722"
                strokeWidth={2}
                dot={{ fill: '#FF5722', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="ticketSales"
                name="Ticket Sales"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ fill: '#4CAF50', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="roas" 
                name="ROAS"
                stroke="#9b87f5"
                strokeWidth={2}
                dot={{ fill: '#9b87f5', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
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
