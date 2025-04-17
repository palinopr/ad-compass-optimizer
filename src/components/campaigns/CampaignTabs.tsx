
import React, { useEffect } from 'react';
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

  // Add debug logging for component rendering and data flow
  useEffect(() => {
    console.log('[CAMPAIGN TABS] Rendering with:', { 
      activeTab, 
      campaignCount: campaigns?.length || 0,
      filteredCount: filteredCampaigns?.length || 0,
      isLoading,
      hasError: !!error,
      fetchCompleted,
      campaignsFetchStatus
    });
    
    if (campaigns && campaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN TABS] Empty campaigns array but no loading or error state');
    }

    // Show toast notification when campaigns are loaded
    if (campaigns && campaigns.length > 0 && !isLoading) {
      const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';
      
      toast({
        title: isUsingMaximumFallback ? "Using maximum date range" : "Campaigns loaded",
        description: `${campaigns.length} campaigns available${isUsingMaximumFallback ? ' (using maximum date range)' : ' with date preset: last_30d'}`,
        duration: 3000
      });
    }
  }, [campaigns, filteredCampaigns, isLoading, error, activeTab, fetchCompleted, campaignsFetchStatus]);

  // Safety check for campaigns array
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];
  
  // Check if we're using maximum date preset as a fallback
  const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';

  return (
    <>
      <div style={{ background: '#f0fff0', padding: '10px', marginBottom: '10px', border: '1px solid green' }}>
        ✅ CampaignTabs Component Loaded - ActiveTab: {activeTab} - Campaigns: {safeCampaigns.length}
        {isUsingMaximumFallback && <div className="mt-2 text-orange-600 font-semibold">Using maximum date range fallback</div>}
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
            status="active"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="active"
            refetchCampaigns={refetchCampaigns}
            forceRender={0}
            isAuthenticated={true}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <CampaignList 
            status="draft"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="draft"
            refetchCampaigns={refetchCampaigns}
            forceRender={0}
            isAuthenticated={true}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
        </TabsContent>
        
        <TabsContent value="archived">
          <CampaignList 
            status="archived"
            isLoading={isLoading}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            error={error}
            errorDetails={errorDetails}
            activeTab="archived"
            refetchCampaigns={refetchCampaigns}
            forceRender={0}
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
