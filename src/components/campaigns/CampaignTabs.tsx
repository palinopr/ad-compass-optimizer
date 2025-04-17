
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignList from '@/components/campaigns/CampaignList';
import { Info } from 'lucide-react';
import { useCampaigns } from '@/hooks/campaigns';
import { toast } from '@/hooks/use-toast';

interface CampaignTabsProps {
  activeTab: 'active' | 'draft' | 'archived';
  setActiveTab: (tab: 'active' | 'draft' | 'archived') => void;
}

const CampaignTabs: React.FC<CampaignTabsProps> = ({ activeTab, setActiveTab }) => {
  // Force a re-render when fallback happens
  const [fallbackRender, setFallbackRender] = useState(0);
  
  // Track if we're using the maximum fallback
  const [isUsingMaximumFallback, setIsUsingMaximumFallback] = useState(
    localStorage.getItem('force_maximum_date_preset') === 'true'
  );
  
  // Track fallback reason for display
  const [fallbackReason, setFallbackReason] = useState(
    localStorage.getItem('date_preset_fallback_reason') || 'No data found for Last 30 Days'
  );
  
  // Get campaign data from the hook to pass to each tab
  const {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns,
    fetchCompleted,
    campaignsFetchStatus,
    metaPermissionsInvalid,
    forceUiRefresh
  } = useCampaigns(activeTab);

  // Listen for fallback events to force re-render
  useEffect(() => {
    const handleFallbackEvent = (event: Event) => {
      // Cast to CustomEvent to access the detail property
      const customEvent = event as CustomEvent;
      const reason = customEvent.detail?.reason || 'Unknown reason';
      const shouldRefresh = customEvent.detail?.shouldRefresh || false;
      
      console.log(`[CAMPAIGN TABS] 🔄 Date preset fallback detected: ${reason}, should refresh: ${shouldRefresh}`);
      
      // Update UI state to show fallback
      setIsUsingMaximumFallback(true);
      setFallbackReason(reason);
      
      // Force re-render to update UI
      setFallbackRender(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: "Using extended date range",
        description: `Fallback triggered: ${reason}`,
        duration: 5000
      });
      
      // Trigger a refetch if requested
      if (shouldRefresh) {
        console.log('[CAMPAIGN TABS] Triggering campaign refetch due to fallback event');
        setTimeout(() => {
          refetchCampaigns(true);
        }, 300);
      }
    };
    
    window.addEventListener('date-preset-fallback-triggered', handleFallbackEvent);
    
    // Check localStorage on mount and update state
    const checkFallbackStatus = () => {
      const isFallbackActive = localStorage.getItem('force_maximum_date_preset') === 'true';
      const storedReason = localStorage.getItem('date_preset_fallback_reason') || 'No data found for Last 30 Days';
      
      if (isFallbackActive !== isUsingMaximumFallback) {
        setIsUsingMaximumFallback(isFallbackActive);
      }
      
      if (storedReason !== fallbackReason) {
        setFallbackReason(storedReason);
      }
    };
    
    checkFallbackStatus();
    
    return () => {
      window.removeEventListener('date-preset-fallback-triggered', handleFallbackEvent);
    };
  }, [refetchCampaigns, isUsingMaximumFallback, fallbackReason]);

  // Add debug logging for component rendering and data flow
  useEffect(() => {
    console.log('[CAMPAIGN TABS] Rendering with:', { 
      activeTab, 
      campaignCount: campaigns?.length || 0,
      filteredCount: filteredCampaigns?.length || 0,
      isLoading,
      hasError: !!error,
      fetchCompleted,
      campaignsFetchStatus,
      fallbackRender,
      isUsingMaximumFallback
    });
    
    if (campaigns && campaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN TABS] Empty campaigns array but no loading or error state');
    }

    // Show toast notification when campaigns are loaded
    if (campaigns && campaigns.length > 0 && !isLoading) {
      toast({
        title: isUsingMaximumFallback ? "Using fallback date range: Maximum" : "Campaigns loaded",
        description: `${campaigns.length} campaigns available${isUsingMaximumFallback ? ' (no data found for Last 30 Days)' : ' with date preset: last_30d'}`,
        duration: 3000
      });
    }
  }, [campaigns, filteredCampaigns, isLoading, error, activeTab, fetchCompleted, campaignsFetchStatus, fallbackRender, isUsingMaximumFallback]);

  // Safety check for campaigns array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];

  return (
    <>
      <div style={{ background: '#f0fff0', padding: '10px', marginBottom: '10px', border: '1px solid green' }}>
        ✅ CampaignTabs Component Loaded - ActiveTab: {activeTab} - Campaigns: {safeCampaigns.length}
        {isUsingMaximumFallback && (
          <div className="mt-2 text-orange-600 font-semibold">
            Using fallback date range: Maximum (no data found for Last 30 Days)
          </div>
        )}
      </div>
      
      {/* Fallback notification banner */}
      {isUsingMaximumFallback && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-md">
          <h4 className="font-medium text-amber-800">Using fallback date range: Maximum</h4>
          <p className="text-amber-700 text-sm mt-1">
            {fallbackReason || 'No data found for Last 30 Days'}
          </p>
        </div>
      )}
      
      <Tabs 
        defaultValue="campaigns" 
        value={activeTab} 
        onValueChange={(value) => {
          // Ensure we only set valid tab values
          if (value === 'active' || value === 'draft' || value === 'archived') {
            setActiveTab(value);
          }
        }}
        key={`campaign-tabs-${fallbackRender}`} // Force tabs to re-render when fallback changes
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="draft">Paused/Draft</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <CampaignList 
            key={`active-campaigns-${fallbackRender}`}
            status="active"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="active"
            refetchCampaigns={refetchCampaigns}
            forceRender={fallbackRender}
            isAuthenticated={true}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <CampaignList 
            key={`draft-campaigns-${fallbackRender}`}
            status="draft"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="draft"
            refetchCampaigns={refetchCampaigns}
            forceRender={fallbackRender}
            isAuthenticated={true}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
        </TabsContent>
        
        <TabsContent value="archived">
          <CampaignList 
            key={`archived-campaigns-${fallbackRender}`}
            status="archived"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="archived"
            refetchCampaigns={refetchCampaigns}
            forceRender={fallbackRender}
            isAuthenticated={true}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default CampaignTabs;
