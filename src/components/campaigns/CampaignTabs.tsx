
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignList from '@/components/campaigns/CampaignList';

interface CampaignTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CampaignTabs: React.FC<CampaignTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs defaultValue="campaigns" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
        <TabsTrigger value="drafts">Paused/Draft</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      
      <TabsContent value="campaigns">
        <CampaignList status="active" />
      </TabsContent>
      
      <TabsContent value="drafts">
        <CampaignList status="draft" />
      </TabsContent>
      
      <TabsContent value="archived">
        <CampaignList status="archived" />
      </TabsContent>
    </Tabs>
  );
};

export default CampaignTabs;
