
import React, { useEffect, useState } from 'react';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkRateLimitStatus } from '@/hooks/campaigns/fetch-utils/rateLimit';
import RateLimitedSection from '@/components/campaigns/diagnostic-components/RateLimitedSection';

export default function Dashboard() {
  // Check if we need to show diagnostic info based on localStorage
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const hasDataButNotShowing = campaignCount > 0 && fetchSuccess;
  
  // Check rate limit status
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    isRateLimited: boolean;
    timeRemaining: number | null;
    rateLimitTimestamp: string | null;
  }>({ isRateLimited: false, timeRemaining: null, rateLimitTimestamp: null });
  
  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };
  
  useEffect(() => {
    // Initialize rate limit handling
    MetaApiService.initRateLimitState();
    
    // Check for any override settings
    const isOverridden = MetaApiService.isRateLimitOverridden();
    if (isOverridden) {
      console.warn('⚠️ Meta API rate limit override is active. This should only be used for development.');
    }
    
    // Get current rate limit status
    const rateLimitInfo = checkRateLimitStatus();
    setRateLimitStatus(rateLimitInfo);
    console.log('Current rate limit status:', rateLimitInfo);
    
    // Check rate limit state every minute
    const intervalId = setInterval(() => {
      const updatedStatus = checkRateLimitStatus();
      setRateLimitStatus(updatedStatus);
      console.log('Updated rate limit status:', updatedStatus);
    }, 60000);
    
    // Log the current rate limit state for debugging
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
      hasDataButNotShowing: parseInt(campaignCount || '0') > 0 && fetchSuccess === 'true',
      rateLimitActive: rateLimitInfo.isRateLimited,
      rateLimitRemaining: rateLimitInfo.timeRemaining
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
    
    return () => clearInterval(intervalId);
  }, []);

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
        
        {/* Add Debug Status Information */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              System Diagnostic Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">API Status:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Rate Limited: <span className={rateLimitStatus.isRateLimited ? "text-red-600 font-bold" : "text-green-600"}>{rateLimitStatus.isRateLimited ? "Yes" : "No"}</span></li>
                  {rateLimitStatus.isRateLimited && (
                    <li>Time Remaining: <span className="font-medium">{rateLimitStatus.timeRemaining} minutes</span></li>
                  )}
                  <li>Last Limit Hit: {formatTimestamp(rateLimitStatus.rateLimitTimestamp)}</li>
                  <li>API Usage History: {localStorage.getItem('meta_rate_limit_history') ? JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]').length : '0'} events</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Campaign Data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Campaigns Count: <span className="font-medium">{campaignCount}</span></li>
                  <li>Last Fetch: <span className="font-medium">{formatTimestamp(localStorage.getItem('last_campaign_fetch_attempt'))}</span></li>
                  <li>Fetch Success: <span className={fetchSuccess ? "text-green-600" : "text-red-600 font-bold"}>{fetchSuccess ? "Yes" : "No"}</span></li>
                  <li>Display Issues: <span className={hasDataButNotShowing ? "text-red-600 font-bold" : "text-green-600"}>{hasDataButNotShowing ? "Yes" : "No"}</span></li>
                </ul>
              </div>
            </div>
            <div>
              <p className="font-semibold mt-2">Debug Actions:</p>
              <div className="flex gap-2 mt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    // Force clear rate limit
                    localStorage.removeItem('meta_rate_limit_timestamp');
                    localStorage.removeItem('meta_rate_limit_history');
                    window.location.reload();
                  }}
                >
                  Clear Rate Limit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    // Log all localStorage items
                    console.log('All localStorage items:');
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key) {
                        console.log(`${key}: ${localStorage.getItem(key)}`);
                      }
                    }
                  }}
                >
                  Debug: Log Storage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => window.location.href = '/campaigns?debug=true'}
                >
                  Go To Campaigns
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
