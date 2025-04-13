
import React from 'react';
import { Separator } from '@/components/ui/separator';
import TokenBasicInfo from './token-sections/TokenBasicInfo';
import ApiStatusSection from './token-sections/ApiStatusSection';
import DataLoadingSection from './token-sections/DataLoadingSection';
import DataDisplaySection from './token-sections/DataDisplaySection';
import CorsIssueSection from './token-sections/CorsIssueSection';
import TroubleshootingSection from './token-sections/TroubleshootingSection';
import { parseErrorMessage, checkDataInconsistency, checkUIDisplayIssue, formatTimestamp } from './token-sections/TokenStateUtil';

interface TokenDetailsProps {
  tokenInfo: {
    hasToken: boolean;
    tokenLength?: number;
    tokenAge?: number | null;
    source?: string;
    isValid?: boolean;
    permissions?: string[];
  };
  tokenAnalysis?: any; // Token analysis prop
}

const TokenDetails: React.FC<TokenDetailsProps> = ({ tokenInfo, tokenAnalysis }) => {
  // Get the most recent fetch attempt timestamp from localStorage
  const lastFetchAttempt = localStorage.getItem('last_campaign_fetch_attempt');
  const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  // Format the timestamp for display if it exists
  const formattedFetchTime = formatTimestamp(lastFetchAttempt);
  
  // Parse any stored errors
  const fetchErrorRaw = localStorage.getItem('last_campaign_fetch_error');
  const fetchError = parseErrorMessage(fetchErrorRaw);

  // Check campaign count
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  
  // Check for the data inconsistency scenario
  const hasDataInconsistency = checkDataInconsistency(lastFetchSuccess, campaignCount, tokenAnalysis);
  
  // Check for confirmed data loading but display issues
  const hasUIDisplayIssue = checkUIDisplayIssue(campaignCount, window.location.pathname, tokenAnalysis);
  
  // Force reload function to clear cache and reload page
  const handleForceReload = () => {
    // Clear all relevant cache items
    localStorage.removeItem('last_campaign_fetch_attempt');
    localStorage.removeItem('last_campaign_fetch_success');
    localStorage.removeItem('last_campaign_fetch_error');
    localStorage.removeItem('last_campaign_count');
    
    // Force reload the page
    window.location.reload();
  };
  
  // Handle hard reset of auth
  const handleHardReset = () => {
    // Clear all auth-related items
    localStorage.removeItem('meta_access_token');
    localStorage.removeItem('meta_auth_valid');
    localStorage.removeItem('meta_auth_checked');
    localStorage.removeItem('meta_user_id');
    localStorage.removeItem('meta_user_name');
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    localStorage.removeItem('last_campaign_fetch_attempt');
    localStorage.removeItem('last_campaign_fetch_success');
    localStorage.removeItem('last_campaign_fetch_error');
    localStorage.removeItem('last_campaign_count');
    
    // Force reload the page
    window.location.reload();
  };
  
  // Handle full page refresh with cache clearing
  const handleFullPageRefresh = () => {
    // This will attempt to bypass browser cache entirely
    window.location.href = window.location.href + '?nocache=' + new Date().getTime();
  };
  
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
      <TokenBasicInfo tokenInfo={tokenInfo} />
      
      <ApiStatusSection 
        lastFetchAttempt={lastFetchAttempt}
        lastFetchSuccess={lastFetchSuccess}
        fetchError={fetchError}
        formattedFetchTime={formattedFetchTime}
        tokenAnalysis={tokenAnalysis}
      />
      
      <DataLoadingSection 
        campaignCount={campaignCount}
        tokenAnalysis={tokenAnalysis}
      />
      
      <DataDisplaySection
        campaignCount={campaignCount}
        hasUIDisplayIssue={hasUIDisplayIssue}
        hasDataInconsistency={hasDataInconsistency}
      />
      
      <CorsIssueSection
        hasCorsIssues={!!tokenAnalysis?.cors?.hasCorsIssues}
        handleFullPageRefresh={handleFullPageRefresh}
      />
      
      <TroubleshootingSection
        tokenAnalysis={tokenAnalysis}
        hasDataInconsistency={hasDataInconsistency}
        hasUIDisplayIssue={hasUIDisplayIssue}
        campaignCount={campaignCount}
        handleForceReload={handleForceReload}
        handleHardReset={handleHardReset}
        handleFullPageRefresh={handleFullPageRefresh}
      />
    </div>
  );
};

export default TokenDetails;
