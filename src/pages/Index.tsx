
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Dollar, MousePointer, Eye, Target, BarChart, Activity } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AppSidebar from '@/components/layout/Sidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import CampaignTable from '@/components/dashboard/CampaignTable';
import InsightsCard from '@/components/dashboard/InsightsCard';
import AudienceInsights from '@/components/dashboard/AudienceInsights';
import OptimizationScore from '@/components/dashboard/OptimizationScore';
import ImportCard from '@/components/dashboard/ImportCard';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 bg-gray-50 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div>
                <SidebarTrigger asChild>
                  <button className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">Toggle sidebar</span>
                  </button>
                </SidebarTrigger>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <MetricCard 
                title="Total Spend" 
                value="$2,456.78" 
                change={12.5} 
                icon={<Dollar className="w-4 h-4" />} 
              />
              <MetricCard 
                title="Impressions" 
                value="1.2M" 
                change={8.3} 
                icon={<Eye className="w-4 h-4" />} 
              />
              <MetricCard 
                title="Clicks" 
                value="45,678" 
                change={-2.1} 
                icon={<MousePointer className="w-4 h-4" />} 
              />
              <MetricCard 
                title="Conversions" 
                value="1,234" 
                change={15.7} 
                icon={<Target className="w-4 h-4" />} 
              />
              <MetricCard 
                title="CPA" 
                value="$12.45" 
                change={-5.3} 
                icon={<BarChart className="w-4 h-4" />} 
              />
              <MetricCard 
                title="ROAS" 
                value="2.8x" 
                change={10.2} 
                icon={<Activity className="w-4 h-4" />} 
              />
            </div>

            {/* Main Content - Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <div className="lg:col-span-1">
                <InsightsCard />
              </div>
            </div>

            {/* Main Content - Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <CampaignTable />
              </div>
              <div className="lg:col-span-1">
                <div className="grid grid-cols-1 gap-6">
                  <OptimizationScore />
                  <ImportCard />
                </div>
              </div>
            </div>

            {/* Main Content - Bottom Row */}
            <div className="grid grid-cols-1 gap-6">
              <AudienceInsights />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
