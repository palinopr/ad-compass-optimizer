
import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import FunnelControls from './FunnelControls';
import { Card } from '@/components/ui/card';
import { useFunnelFilters } from '@/hooks/funnel/useFunnelFilters';
import { useFunnelData } from '@/hooks/funnel/useFunnelData';
import { useApiTesting } from '@/hooks/funnel/useApiTesting';
import FunnelHeader from './header/FunnelHeader';
import FunnelDebugPanel from './debug/FunnelDebugPanel';
import FunnelEmptyState from './states/FunnelEmptyState';
import FunnelApiResponse from './debug/FunnelApiResponse';

const FunnelViewContainer = () => {
  const { campaigns, isLoading: campaignsLoading, refetchCampaigns } = useCampaigns();
  const [showDebug, setShowDebug] = useState(true);

  // Use our custom hooks for state management and data fetching
  const {
    funnelData,
    isFetchingFunnel,
    funnelError,
    rawApiResponse,
    lastRequestDetails,
    buildVersion,
    datePreset,
    handleManualRefresh
  } = useFunnelData();

  const { testDirectApiCall, verifyPermissions } = useApiTesting((response) => {
    // Here we're passing the setRawApiResponse function to the hook
    // This allows the hook to update the rawApiResponse state
    const updatedResponse = { ...rawApiResponse, ...response };
    // Since we're not directly accessing the setter from useFunnelData, we're storing in localStorage
    // and the effect in useFunnelData will pick it up
    localStorage.setItem('raw_campaign_response', JSON.stringify(updatedResponse));
  });

  const {
    filteredData,
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    setSortField,
    setSortDirection,
    setStatusFilter,
    setSearchQuery
  } = useFunnelFilters(funnelData);

  return (
    <Card>
      <div className="p-6">
        <FunnelHeader
          buildVersion={buildVersion}
          showDebug={showDebug}
          onToggleDebug={() => setShowDebug(!showDebug)}
          onRefresh={handleManualRefresh}
          isLoading={isFetchingFunnel || campaignsLoading}
          datePreset={datePreset}
        />
        
        {showDebug && (
          <FunnelDebugPanel
            lastRequestDetails={lastRequestDetails}
            isLoading={isFetchingFunnel}
            testDirectApiCall={testDirectApiCall}
            verifyPermissions={verifyPermissions}
            buildVersion={buildVersion}
            datePreset={datePreset}
          />
        )}
        
        <FunnelControls
          sortField={sortField}
          sortDirection={sortDirection}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onSortFieldChange={setSortField}
          onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          onStatusFilterChange={setStatusFilter}
          onSearchChange={setSearchQuery}
        />
        
        {filteredData.campaigns.length > 0 ? (
          <FunnelView 
            campaigns={filteredData.campaigns} 
            adsets={filteredData.adsets} 
            ads={filteredData.ads} 
          />
        ) : (
          <FunnelEmptyState
            isLoading={campaignsLoading || isFetchingFunnel}
            error={funnelError}
            lastRequestDetails={lastRequestDetails}
            rawApiResponse={rawApiResponse}
            showDebug={showDebug}
            onRefresh={handleManualRefresh}
          />
        )}
        
        {showDebug && rawApiResponse && filteredData.campaigns.length > 0 && (
          <FunnelApiResponse rawApiResponse={rawApiResponse} />
        )}
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
