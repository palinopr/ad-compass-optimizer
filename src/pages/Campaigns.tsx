
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  AlertCircle,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignList from '@/components/campaigns/CampaignList';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const isAuthenticated = metaAuthService.isAuthenticated();
  const [hasAdsPermission, setHasAdsPermission] = useState(false);
  
  useEffect(() => {
    // Check if user has ads permissions
    if (isAuthenticated) {
      const permissions = metaAuthService.getPermissions();
      const hasPermission = permissions.some(p => 
        p === 'ads_management' || p === 'ads_read'
      );
      setHasAdsPermission(hasPermission);
    }
  }, [isAuthenticated]);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    return selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0;
  };
  
  const selectedAdAccount = localStorage.getItem('selected_ad_account');

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
            disabled={showCreateWizard || !isAuthenticated || !hasAdAccount() || !hasAdsPermission}
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
            
            {isAuthenticated && !hasAdsPermission && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  You don't have the necessary permissions to access ad campaigns. Please update your token permissions to include ads_read or ads_management.
                </AlertDescription>
              </Alert>
            )}
            
            {isAuthenticated && hasAdsPermission && !hasAdAccount() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select an ad account to view and manage campaigns.
                </AlertDescription>
              </Alert>
            )}
            
            {isAuthenticated && hasAdsPermission && hasAdAccount() && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Viewing campaigns from your Meta ad account. Campaign creation through the API requires extra permissions.
                </AlertDescription>
              </Alert>
            )}
          
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
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Campaigns;
