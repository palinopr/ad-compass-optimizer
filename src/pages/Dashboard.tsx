
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CampaignsQuickAccess from '@/components/dashboard/CampaignsQuickAccess';
import ProfileQuickAccess from '@/components/dashboard/ProfileQuickAccess';
import InsightsDemoCard from '@/components/insights/InsightsDemoCard';
import ApiRateLimitStatus from '@/components/dashboard/rate-limit/ApiRateLimitStatus';
import { MetaApiService } from '@/services/MetaApiService';
import CampaignDisplayFix from '@/components/dashboard/CampaignDisplayFix';
import CampaignResetButton from '@/components/dashboard/CampaignResetButton';

export default function Dashboard() {
  useEffect(() => {
    // Initialize rate limit handling
    MetaApiService.initRateLimitState();
    
    // Check for any override settings
    const isOverridden = MetaApiService.isRateLimitOverridden();
    if (isOverridden) {
      console.warn('⚠️ Meta API rate limit override is active. This should only be used for development.');
    }
    
    // Log the current rate limit state for debugging
    const rateLimitInfo = MetaApiService.getRateLimitInfo();
    if (rateLimitInfo.isRateLimited) {
      console.log('Current rate limit status:', rateLimitInfo);
    }
    
    // Log campaign data state for debugging
    const campaignCount = localStorage.getItem('last_campaign_count');
    const fetchSuccess = localStorage.getItem('last_campaign_fetch_success');
    console.log('Campaign data state on dashboard load:', {
      storedCount: campaignCount ? parseInt(campaignCount) : 0,
      fetchStatus: fetchSuccess,
      displayIssueDetected: localStorage.getItem('display_issue_detected') === 'true'
    });
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your marketing dashboard.</p>
        </div>
        
        {/* Display Fix Alert - Added to help with campaign display issues */}
        <CampaignDisplayFix />
        
        {/* Campaign Reset Button - Added for more aggressive troubleshooting */}
        <CampaignResetButton />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampaignsQuickAccess />
          <ProfileQuickAccess />
          <InsightsDemoCard />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ApiRateLimitStatus />
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
