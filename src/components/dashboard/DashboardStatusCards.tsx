
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ApiRateLimitStatus from '@/components/dashboard/rate-limit/ApiRateLimitStatus';

const DashboardStatusCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ApiRateLimitStatus />
      <Card>
        <CardHeader>
          <CardHeader>Recent Activity</CardHeader>
        </CardHeader>
        <CardContent>
          <p>No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStatusCards;
