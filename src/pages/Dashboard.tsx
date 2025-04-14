
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
import DiagnosticButton from '@/components/campaigns/DiagnosticButton';

export default function Dashboard() {
  // Check if we need to show diagnostic info based on localStorage
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const hasDataButNotShowing = campaignCount > 0 && fetchSuccess;
  
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
      displayIssueDetected: localStorage.getItem('display_issue_detected') === 'true',
      hasDataButNotShowing: parseInt(campaignCount || '0') > 0 && fetchSuccess === 'true'
    });
    
    // Check for diagnostic data in session storage
    const diagnosticResults = sessionStorage.getItem('last_diagnostic_results');
    if (diagnosticResults) {
      try {
        const results = JSON.parse(diagnosticResults);
        console.log('Last diagnostic results:', results);
      } catch (e) {
        console.error('Error parsing diagnostic results:', e);
      }
    }
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your marketing dashboard.</p>
        </div>
        
        {/* Campaign Display Troubleshooting Controls */}
        <div className={`space-y-4 ${hasDataButNotShowing ? 'bg-amber-50 p-4 border border-amber-200 rounded-md' : ''}`}>
          {hasDataButNotShowing && (
            <div className="bg-white p-3 rounded shadow-sm border border-amber-100 text-amber-800">
              <h3 className="font-bold flex items-center gap-2">
                <span className="bg-amber-100 p-1 rounded">⚠️</span>
                Display Issue Detected
              </h3>
              <p className="text-sm mt-1">
                We've detected that your campaigns data has loaded ({campaignCount} campaigns) but isn't displaying correctly.
                Use the tools below to fix the display issues.
              </p>
            </div>
          )}
          
          {/* Display Fix Alert - Added to help with campaign display issues */}
          <CampaignDisplayFix />
          
          {/* Campaign Reset Button - Added for more aggressive troubleshooting */}
          <CampaignResetButton />
          
          {/* Add diagnostic button */}
          <DiagnosticButton />
        </div>
        
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
