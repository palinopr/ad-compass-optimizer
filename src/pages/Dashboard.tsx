
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, DollarSign, Ticket, BarChart, CreditCard, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, ChevronDown } from 'lucide-react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaReconnectPrompt from '@/components/meta/MetaReconnectPrompt';
import { useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, trend, icon }) => {
  const isTrendPositive = trend && trend > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="bg-slate-100 p-2 rounded-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trend !== undefined && (
            <span className={`flex items-center text-xs ${isTrendPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isTrendPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {Math.abs(trend)}%
            </span>
          )}
          <p className="text-xs text-muted-foreground ml-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const { isAuthenticated, hasPermissions } = useMetaConnection();
  const [timeframe, setTimeframe] = useState('7d');
  
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">Connect your Meta account</h2>
          <p className="text-gray-500 mb-6">
            To view your dashboard and campaign data, please connect your Meta Business account.
          </p>
          <Button asChild>
            <a href="/meta-integration">Connect Meta Account</a>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  if (!hasPermissions) {
    return (
      <AppLayout>
        <MetaReconnectPrompt 
          errorMessage="Your Meta account connection is missing required permissions for ad management." 
          onReconnect={() => window.location.href = '/meta-integration'}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 days
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Revenue" 
              value="$12,234"
              description="vs. previous period" 
              trend={12}
              icon={<DollarSign className="h-4 w-4 text-blue-600" />} 
            />
            <StatCard 
              title="Ticket Sales" 
              value="1,234"
              description="vs. previous period" 
              trend={-5.2}
              icon={<Ticket className="h-4 w-4 text-purple-600" />} 
            />
            <StatCard 
              title="Ad Spend" 
              value="$3,456"
              description="vs. previous period" 
              trend={2.3}
              icon={<CreditCard className="h-4 w-4 text-green-600" />} 
            />
            <StatCard 
              title="ROAS" 
              value="3.54x"
              description="Return on ad spend"
              trend={8.1} 
              icon={<TrendingUp className="h-4 w-4 text-orange-600" />} 
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Campaign performance across all channels</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md">
                  <BarChart3 className="h-16 w-16 text-slate-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Currently running ad campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Summer Sale', 'Product Launch', 'Retargeting'].map((campaign) => (
                    <div key={campaign} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{campaign}</p>
                        <p className="text-xs text-muted-foreground">Meta Ads</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">$1,234</span>
                        <span className="text-xs text-green-500">2.4x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/campaigns">View All Campaigns</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-md">
                  <BarChart className="h-16 w-16 text-slate-200" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Ads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Ad Creative 1', 'Video Ad 2', 'Carousel Ad'].map((ad) => (
                    <div key={ad} className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded mr-2" />
                      <div>
                        <p className="text-sm font-medium">{ad}</p>
                        <p className="text-xs text-green-500">4.2x ROAS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View and download campaign reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Select a report type to generate</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
