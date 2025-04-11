
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

const Analytics = () => {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive analytics for your ad campaigns.</p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Campaign Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Analytics dashboard will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
