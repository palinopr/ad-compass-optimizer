
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, TicketIcon, Users, Calendar } from 'lucide-react';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import MetricCard from '@/components/dashboard/MetricCard';
import AudienceInsights from '@/components/dashboard/AudienceInsights';
import CampaignTable from '@/components/dashboard/CampaignTable';
import EventMetrics from '@/components/dashboard/EventMetrics';

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome to your Outlet Media dashboard.</p>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Impressions" 
            value="102,543" 
            change={12.5} 
            icon={<LayoutDashboard className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Ticket Sales" 
            value="1,245" 
            change={8.2} 
            icon={<TicketIcon className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Audience Reach" 
            value="58,492" 
            change={-3.1} 
            icon={<Users className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Upcoming Events" 
            value="7" 
            icon={<Calendar className="w-4 h-4" />} 
          />
        </div>
        
        {/* Main charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <EventMetrics />
          </div>
        </div>
        
        {/* Demographics and Campaign table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <AudienceInsights />
          </div>
          <div className="lg:col-span-2">
            <CampaignTable />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
