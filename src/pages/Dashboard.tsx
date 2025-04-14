
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RateLimitedSection from '@/components/campaigns/diagnostic-components/RateLimitedSection';
import { useDashboardState } from '@/hooks/dashboard/useDashboardState';
import DashboardTroubleSection from '@/components/dashboard/diagnostic/DashboardTroubleSection';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardStatusCards from '@/components/dashboard/DashboardStatusCards';
import SystemDiagnosticStatus from '@/components/dashboard/diagnostic/SystemDiagnosticStatus';

export default function Dashboard() {
  // Get dashboard state from hook
  const { 
    campaignCount, 
    fetchSuccess, 
    hasDataButNotShowing, 
    rateLimitStatus 
  } = useDashboardState();

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your marketing dashboard.</p>
        </div>
        
        {/* Rate Limit Warning Section */}
        {rateLimitStatus.isRateLimited && (
          <RateLimitedSection rateLimitTimestamp={rateLimitStatus.rateLimitTimestamp} />
        )}
        
        {/* Campaign Display Troubleshooting Controls */}
        <DashboardTroubleSection 
          hasDataButNotShowing={hasDataButNotShowing} 
          campaignCount={campaignCount}
        />
        
        {/* Dashboard Cards */}
        <DashboardCards />
        
        {/* Status Cards */}
        <DashboardStatusCards />
        
        {/* System Diagnostic Status */}
        <SystemDiagnosticStatus 
          rateLimitStatus={rateLimitStatus}
          campaignCount={campaignCount}
          fetchSuccess={fetchSuccess}
        />
      </div>
    </AppLayout>
  );
}
