
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignList from '@/components/campaigns/CampaignList';
import { Info } from 'lucide-react';
import { useCampaigns } from '@/hooks/campaigns';

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
    refetchCampaigns,
    fetchCompleted,
    campaignsFetchStatus
  } = useCampaigns(activeTab);

  return (
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
          campaigns={campaigns}
          filteredCampaigns={filteredCampaigns}
          error={error}
          errorDetails={null}
          activeTab="active"
          refetchCampaigns={refetchCampaigns}
          forceRender={0}
          isAuthenticated={true}
          fetchCompleted={fetchCompleted}
          campaignsFetchStatus={campaignsFetchStatus}
        />
      </TabsContent>
      
      <TabsContent value="draft">
        <CampaignList 
          status="draft"
          isLoading={isLoading}
          campaigns={campaigns}
          filteredCampaigns={filteredCampaigns}
          error={error}
          errorDetails={null}
          activeTab="draft"
          refetchCampaigns={refetchCampaigns}
          forceRender={0}
          isAuthenticated={true}
          fetchCompleted={fetchCompleted}
          campaignsFetchStatus={campaignsFetchStatus}
        />
      </TabsContent>
      
      <TabsContent value="archived">
        <CampaignList 
          status="archived"
          isLoading={isLoading}
          campaigns={campaigns}
          filteredCampaigns={filteredCampaigns}
          error={error}
          errorDetails={null}
          activeTab="archived"
          refetchCampaigns={refetchCampaigns}
          forceRender={0}
          isAuthenticated={true}
          fetchCompleted={fetchCompleted}
          campaignsFetchStatus={campaignsFetchStatus}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CampaignTabs;
