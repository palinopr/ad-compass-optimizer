
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  PlusCircle, 
  ArrowRight, 
  Target, 
  Users, 
  Image, 
  DollarSign, 
  LayoutGrid,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignList from '@/components/campaigns/CampaignList';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const isAuthenticated = metaAuthService.isAuthenticated();

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your Meta advertising campaigns for events.</p>
          </div>
          <Button 
            onClick={() => setShowCreateWizard(true)}
            className="bg-meta-blue hover:bg-meta-dark"
            disabled={showCreateWizard || !isAuthenticated}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        
        {showCreateWizard ? (
          <CampaignCreationWizard onCancel={() => setShowCreateWizard(false)} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <MetaConnect />
              {isAuthenticated && <AdAccountSelector />}
            </div>
          
            <Tabs defaultValue="campaigns" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
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
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Campaigns;
