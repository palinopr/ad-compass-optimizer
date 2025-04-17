
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
    metaPermissionsInvalid
  } = useCampaigns(activeTab);

  // Listen for fallback events to force re-render
  useEffect(() => {
    const handleFallbackEvent = () => {
      console.log('[CAMPAIGN TABS] Date preset fallback detected, forcing re-render');
      setFallbackRender(prev => prev + 1);
    };
    
    window.addEventListener('date-preset-fallback-triggered', handleFallbackEvent);
    
    return () => {
      window.removeEventListener('date-preset-fallback-triggered', handleFallbackEvent);
    };
  }, []);

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
      fallbackRender
    });
    
    if (campaigns && campaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN TABS] Empty campaigns array but no loading or error state');
    }

    // Show toast notification when campaigns are loaded
    if (campaigns && campaigns.length > 0 && !isLoading) {
      const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';
      
      toast({
        title: isUsingMaximumFallback ? "Using fallback date range: Maximum" : "Campaigns loaded",
        description: `${campaigns.length} campaigns available${isUsingMaximumFallback ? ' (no data found for Last 30 Days)' : ' with date preset: last_30d'}`,
        duration: 3000
      });
    }
  }, [campaigns, filteredCampaigns, isLoading, error, activeTab, fetchCompleted, campaignsFetchStatus, fallbackRender]);

  // Safety check for campaigns array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];
  
  // Check if we're using maximum date preset as a fallback
  const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';

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
      
      <Tabs defaultValue="campaigns" value={activeTab} onValueChange={(value) => {
        // Ensure we only set valid tab values
        if (value === 'active' || value === 'draft' || value === 'archived') {
          setActiveTab(value);
        }
      }}>
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
