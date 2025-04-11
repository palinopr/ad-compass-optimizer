
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import MetricCard from '@/components/dashboard/MetricCard';
import AudienceInsights from '@/components/dashboard/AudienceInsights';
import CampaignTable from '@/components/dashboard/CampaignTable';
import EventMetrics from '@/components/dashboard/EventMetrics';
import EventTimelineView from '@/components/dashboard/EventTimelineView';

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your event advertising performance.</p>
          </div>
        </div>
        
        {/* Key Event Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Tickets Sold" 
            value="1,245" 
            change={8.2}
            trend={+52}
            trendLabel="vs. last week" 
            icon={<Ticket className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Ticket Revenue" 
            value="$62,250" 
            change={12.5}
            trend={+2600}
            trendLabel="vs. last week" 
            icon={<DollarSign className="w-4 h-4" />} 
          />
          <MetricCard 
            title="Ad Spend" 
            value="$15,425" 
            change={3.6}
            trend={+525}
            trendLabel="vs. last week"
            trendDesired="down" 
            icon={<DollarSign className="w-4 h-4" />} 
          />
          <MetricCard 
            title="ROAS" 
            value="4.0x" 
            change={8.7}
            trend={+0.3}
            trendLabel="vs. last week" 
            icon={<TrendingUp className="w-4 h-4" />} 
          />
        </div>
        
        {/* Event Timeline View */}
        <div className="grid grid-cols-1 gap-6">
          <EventTimelineView />
        </div>
        
        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <PerformanceChart />
          </div>
        </div>
        
        {/* Events Table */}
        <div className="grid grid-cols-1 gap-6">
          <EventMetrics />
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
