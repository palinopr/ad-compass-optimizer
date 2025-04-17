
import React from 'react';
import { Card } from '@/components/ui/card';
import CampaignTable from './CampaignTable';
import { UseCampaignsResult } from '@/hooks/campaigns/types';
import { LoadingView } from './states/LoadingView';
import ErrorView from './states/ErrorView';
import { metaPermissionsInvalid } from '@/hooks/campaigns/utils/metaPermissionsUtils';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';
import EmptyState from './states/EmptyState';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CampaignListProps {
  isLoading: boolean;
  campaigns: UseCampaignsResult['campaigns'];
  error: UseCampaignsResult['error'];
  errorDetails: UseCampaignsResult['errorDetails'];
  activeTab: 'active' | 'draft' | 'archived';
  filteredCampaigns: UseCampaignsResult['campaigns'];
  refetchCampaigns: () => void;
  forceRender: number;
  isAuthenticated: boolean;
  fetchCompleted: boolean;
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
  status?: 'active' | 'draft' | 'archived' | string;
  metaPermissionsInvalid?: boolean;
}

const CampaignList: React.FC<CampaignListProps> = ({
  isLoading,
  campaigns = [],
  error,
  errorDetails,
  activeTab,
  filteredCampaigns = [],
  refetchCampaigns,
  forceRender,
  isAuthenticated,
  fetchCompleted,
  campaignsFetchStatus,
  status
}) => {
  // Debug log to track campaign state
  React.useEffect(() => {
    console.log(`🧾 [CAMPAIGN LIST] Rendering with ${campaigns?.length || 0} campaigns`, {
      isLoading,
      hasError: !!error,
      activeTab,
      status,
      campaignsFetchStatus,
      fetchCompleted,
      metaPermissionsInvalid,
      selectedAdAccount: localStorage.getItem('selected_ad_account')
    });
    
    if (campaigns && campaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN LIST] Empty campaigns array but no loading or error state');
      console.warn("Campaign data is empty at CampaignList");
    }
    
    if (campaigns && campaigns.length > 0) {
      console.log('[CAMPAIGN LIST] First few campaigns:', campaigns.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    }
    
    // Added direct console log of raw campaign data
    console.log("[UI] Rendering raw campaign list:", campaigns);
  }, [campaigns, isLoading, error, activeTab, status, campaignsFetchStatus, fetchCompleted]);

  // Check if we're using maximum date preset as a fallback
  const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';
  
  // Get selected ad account for display
  const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'unknown';

  // Show loading state if the app is loading campaigns
  if (isLoading) {
    return (
      <>
        <div style={{ background: 'yellow', padding: '10px', marginBottom: '10px' }}>
          ✅ CampaignList Loaded - Loading State
        </div>
        <LoadingView />
      </>
    );
  }

  // Show error state if there was an error (except for unauthorized or permissions issues, which are handled in CampaignTable)
  if (error && campaignsFetchStatus !== 'unauthorized' && !metaPermissionsInvalid) {
    return (
      <>
        <div style={{ background: 'yellow', padding: '10px', marginBottom: '10px' }}>
          ✅ CampaignList Loaded - Error State
        </div>
        <ErrorView
          error={error}
          errorDetails={errorDetails}
          effectiveIsAuthenticated={isAuthenticated}
          onRetry={refetchCampaigns}
        />
      </>
    );
  }

  // First, check for empty campaign array to show user-friendly message
  if (!campaigns || campaigns.length === 0) {
    return (
      <>
        <div style={{ background: 'yellow', padding: '10px', marginBottom: '10px' }}>
          ✅ CampaignList Loaded - Empty State
        </div>
        <EmptyState 
          icon="📅" 
          title={isUsingMaximumFallback 
            ? "No Campaigns Found (Maximum Date Range)" 
            : "No Campaigns Found For This Date Range"}
          description={isUsingMaximumFallback 
            ? `We couldn't find any campaigns in this ad account (${selectedAdAccount}) even with maximum date range.` 
            : `No campaigns found for the current date range. We've tried using the "last_30d" preset.`}
          adAccountId={selectedAdAccount}
          onRefresh={refetchCampaigns}
        >
          {isUsingMaximumFallback ? (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700">
                No data was found even after trying the maximum date range. This could mean:
              </p>
              <ul className="list-disc pl-5 mt-2 text-amber-700">
                <li>This ad account has no campaign data</li>
                <li>There may be permission issues</li>
                <li>The Meta API may be experiencing issues</li>
              </ul>
              <Button 
                variant="outline" 
                className="mt-3 bg-amber-100 hover:bg-amber-200 border-amber-300"
                onClick={refetchCampaigns}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700">
                We'll automatically try fetching with maximum date range next.
              </p>
            </div>
          )}
        </EmptyState>
      </>
    );
  }

  // This is the main fallback rendering to ensure visibility of all campaigns
  return (
    <>
      <div style={{ background: 'yellow', padding: '10px', marginBottom: '10px' }}>
        ✅ CampaignList Loaded - Showing {campaigns.length} Campaigns
      </div>
      
      <Card className="overflow-hidden">
        {/* Campaign count header */}
        <div className={`p-4 border-b ${isUsingMaximumFallback ? 'bg-amber-100 border-amber-200' : 'bg-green-100 border-green-200'}`}>
          <h2 className={`text-xl font-bold ${isUsingMaximumFallback ? 'text-amber-800' : 'text-green-800'}`}>
            Total campaigns: {campaigns.length}
          </h2>
          <p className={`text-sm ${isUsingMaximumFallback ? 'text-amber-700' : 'text-green-700'}`}>
            {isUsingMaximumFallback 
              ? "Using maximum date range (campaigns from all time)" 
              : "Using default 30-day date range"}
          </p>
          {isUsingMaximumFallback && (
            <p className="text-xs text-amber-600 mt-1">
              Note: Showing all campaigns across all time periods due to limited data in recent timeframes.
            </p>
          )}
        </div>

        {/* Campaign table */}
        <CampaignTable 
          campaigns={campaigns}
          status={activeTab as 'active' | 'draft' | 'archived'}
        />
      </Card>
    </>
  );
};

export default CampaignList;
