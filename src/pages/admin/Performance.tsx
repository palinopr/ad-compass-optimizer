
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const Performance = () => {
  return (
    <AppLayout>
      <div className="space-y-6 p-4 max-w-full">
        <h1 className="text-2xl font-bold tracking-tight">Agency Performance</h1>
        <p className="text-muted-foreground">Overall agency performance metrics.</p>
        
        {/* Chart container with proper spacing */}
        <div className="w-full">
          <PerformanceChart />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Additional Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Agency-wide performance tracking will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Performance;
