
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CampaignsQuickAccess from '@/components/dashboard/CampaignsQuickAccess';
import ProfileQuickAccess from '@/components/dashboard/ProfileQuickAccess';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your marketing dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampaignsQuickAccess />
          <ProfileQuickAccess />
          {/* Add other quick access cards here */}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
