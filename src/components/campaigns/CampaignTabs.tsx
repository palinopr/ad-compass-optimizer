
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignList from '@/components/campaigns/CampaignList';
import { Info } from 'lucide-react';

interface CampaignTabsProps {
  activeTab: 'active' | 'draft' | 'archived';
  setActiveTab: (tab: 'active' | 'draft' | 'archived') => void;
}

const CampaignTabs: React.FC<CampaignTabsProps> = ({ activeTab, setActiveTab }) => {
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
        <CampaignList status="active" />
      </TabsContent>
      
      <TabsContent value="draft">
        <CampaignList status="draft" />
      </TabsContent>
      
      <TabsContent value="archived">
        <CampaignList status="archived" />
      </TabsContent>
    </Tabs>
  );
};

export default CampaignTabs;
