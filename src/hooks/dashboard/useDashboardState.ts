
import { useState, useEffect } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { checkRateLimitStatus } from '@/hooks/campaigns/fetch-utils';

export function useDashboardState() {
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

  return {
    campaignCount,
    fetchSuccess,
    hasDataButNotShowing,
    rateLimitStatus
  };
}
