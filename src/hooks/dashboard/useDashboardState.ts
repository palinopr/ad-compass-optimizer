
import { useState, useEffect } from 'react';

interface DashboardState {
  campaignCount: number;
  fetchSuccess: boolean;
  hasDataButNotShowing: boolean;
  rateLimitStatus: {
    isRateLimited: boolean;
    timeRemaining: number | null;
    rateLimitTimestamp: string | null;
  };
}

export function useDashboardState(): DashboardState {
  const [state, setState] = useState<DashboardState>({
    campaignCount: 0,
    fetchSuccess: false,
    hasDataButNotShowing: false,
    rateLimitStatus: {
      isRateLimited: false,
      timeRemaining: null,
      rateLimitTimestamp: null
    }
  });
  
  useEffect(() => {
    // Load initial state
    updateState();
    
    // Set up interval to check rate limit status
    const interval = setInterval(() => {
      const rateLimitTimestamp = localStorage.getItem('meta_rate_limit_timestamp');
      if (rateLimitTimestamp) {
        updateRateLimitStatus();
      }
    }, 60000); // Check every minute
    
    // Listen for data changes
    const handleStorageChange = () => {
      updateState();
    };
    
    // Listen for data refresh events
    const handleDataRefresh = () => {
      setTimeout(updateState, 500); // Wait for data to update
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('campaign-data-refresh', handleDataRefresh);
    window.addEventListener('campaign-display-refresh', handleDataRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('campaign-data-refresh', handleDataRefresh);
      window.removeEventListener('campaign-display-refresh', handleDataRefresh);
    };
  }, []);
  
  // Update all dashboard state from localStorage
  const updateState = () => {
    // Get campaign data state
    const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
    const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
    const displayIssueDetected = localStorage.getItem('display_issue_detected') === 'true';
    
    // Check for data/UI inconsistency
    const hasDataButNotShowing = campaignCount > 0 && fetchSuccess && displayIssueDetected;
    
    // Update rate limit status
    const rateLimitStatus = updateRateLimitStatus();
    
    // Log the current state for debugging
    console.log('Campaign data state on dashboard load:', {
      storedCount: campaignCount,
      fetchStatus: fetchSuccess ? 'success' : fetchSuccess === false ? 'failed' : null,
      displayIssueDetected,
      hasDataButNotShowing,
      rateLimitActive: rateLimitStatus.isRateLimited,
      rateLimitRemaining: rateLimitStatus.timeRemaining
    });
    
    setState({
      campaignCount,
      fetchSuccess,
      hasDataButNotShowing,
      rateLimitStatus
    });
  };
  
  // Check current rate limit status
  const updateRateLimitStatus = () => {
    const timestamp = localStorage.getItem('meta_rate_limit_timestamp');
    
    if (!timestamp) {
      const status = {
        isRateLimited: false,
        timeRemaining: null,
        rateLimitTimestamp: null
      };
      console.log('Updated rate limit status:', status);
      return status;
    }
    
    const rateLimitTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (rateLimitTime - currentTime) / (1000 * 60);
    
    // If more than 10 minutes have passed, clear the rate limit
    if (diffMinutes <= 0) {
      localStorage.removeItem('meta_rate_limit_timestamp');
      const status = {
        isRateLimited: false,
        timeRemaining: null,
        rateLimitTimestamp: null
      };
      console.log('Updated rate limit status:', status);
      return status;
    }
    
    const status = {
      isRateLimited: true,
      timeRemaining: Math.ceil(diffMinutes),
      rateLimitTimestamp: timestamp
    };
    console.log('Updated rate limit status:', status);
    return status;
  };
  
  return state;
}
