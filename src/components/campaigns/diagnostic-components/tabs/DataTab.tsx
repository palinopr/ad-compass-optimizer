
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import TokenBasicInfo from '../token-sections/TokenBasicInfo';
import ApiStatusSection from '../token-sections/ApiStatusSection';
import DataLoadingSection from '../token-sections/DataLoadingSection';
import CorsIssueSection from '../token-sections/CorsIssueSection';
import DataDisplaySection from '../token-sections/DataDisplaySection';
import TroubleshootingSection from '../token-sections/TroubleshootingSection';
import { parseErrorMessage, checkDataInconsistency, checkUIDisplayIssue, formatTimestamp } from '../token-sections/TokenStateUtil';
import RateLimitedSection from '../RateLimitedSection';

interface DataTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const DataTab: React.FC<DataTabProps> = ({ diagnosticResults, runDiagnostic }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Get rate limit information
  const rateLimitTimestamp = localStorage.getItem('meta_rate_limit_timestamp');
  
  // Extract error message
  const lastFetchError = localStorage.getItem('last_campaign_fetch_error');
  const fetchError = parseErrorMessage(lastFetchError);
  
  // Extract campaign count
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0', 10);
  
  // Get last fetch timestamp and success status
  const lastFetchAttempt = localStorage.getItem('last_campaign_fetch_attempt');
  const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  // Format time for display
  const formattedFetchTime = formatTimestamp(lastFetchAttempt);
  
  // Check for data inconsistency and UI display issues
  const hasDataInconsistency = checkDataInconsistency(lastFetchSuccess, campaignCount, diagnosticResults?.tokenAnalysis);
  const hasUIDisplayIssue = checkUIDisplayIssue(campaignCount, window.location.pathname, diagnosticResults?.tokenAnalysis);
  
  // Handlers for troubleshooting actions
  const handleForceReload = () => {
    window.location.reload();
  };
  
  const handleHardReset = () => {
    localStorage.removeItem('meta_access_token');
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };
  
  const handleFullPageRefresh = () => {
    // Use localStorage to signal a full refresh is happening
    localStorage.setItem('full_page_refresh', 'true');
    localStorage.setItem('full_page_refresh_timestamp', new Date().toISOString());
    
    // Force a hard navigation
    window.location.href = '/?forcefresh=' + Date.now();
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    runDiagnostic();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Data Loading Status</h3>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="text-sm">
        {/* Rate limit section - show first if affected */}
        <RateLimitedSection rateLimitTimestamp={rateLimitTimestamp} />
        
        {/* API status section */}
        <ApiStatusSection
          lastFetchAttempt={lastFetchAttempt}
          lastFetchSuccess={lastFetchSuccess}
          fetchError={fetchError}
          formattedFetchTime={formattedFetchTime}
          tokenAnalysis={diagnosticResults?.tokenAnalysis}
        />
        
        {/* Data loading section */}
        <DataLoadingSection
          campaignCount={campaignCount}
          tokenAnalysis={diagnosticResults?.tokenAnalysis}
        />
        
        {/* CORS issues section */}
        <CorsIssueSection
          hasCorsIssues={diagnosticResults?.cors?.hasCorsIssues || false}
          handleFullPageRefresh={handleFullPageRefresh}
        />
        
        {/* Data display section */}
        <DataDisplaySection
          campaignCount={campaignCount}
          hasUIDisplayIssue={hasUIDisplayIssue}
          hasDataInconsistency={hasDataInconsistency}
        />
        
        {/* Advanced troubleshooting section */}
        <TroubleshootingSection
          tokenAnalysis={diagnosticResults?.tokenAnalysis}
          hasDataInconsistency={hasDataInconsistency}
          hasUIDisplayIssue={hasUIDisplayIssue}
          campaignCount={campaignCount}
          fetchError={fetchError}
          handleForceReload={handleForceReload}
          handleHardReset={handleHardReset}
          handleFullPageRefresh={handleFullPageRefresh}
        />
      </div>
    </div>
  );
};

export default DataTab;
