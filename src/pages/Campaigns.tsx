
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  AlertCircle,
  Info,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignList from '@/components/campaigns/CampaignList';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignDiagnostics from '@/components/campaigns/CampaignDiagnostics';

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const { isAuthenticated, hasPermissions, userData, checkAuth } = useMetaConnection();
  
  useEffect(() => {
    // Force check auth status when component mounts
    checkAuth();
    
    // Check if we should show the connection dialog (set by the ErrorState component)
    const shouldShowConnection = localStorage.getItem('show_meta_connection') === 'true';
    if (shouldShowConnection) {
      console.log('Showing Meta connection dialog due to stored flag');
      setShowConnectionDialog(true);
      localStorage.removeItem('show_meta_connection');
    }
  }, [checkAuth]);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    return selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0;
  };
  
  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful, user data:', userData);
    checkAuth(); // Update the connection state
    setShowConnectionDialog(false);
  };
  
  const handleConnectionError = () => {
    // Just close the dialog but don't update auth state
    setShowConnectionDialog(false);
  };

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
            disabled={showCreateWizard || !isAuthenticated || !hasAdAccount() || !hasPermissions}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        
        {/* Add Lovable Campaign Diagnostics */}
        <CampaignDiagnostics />
        
        {showCreateWizard ? (
          <CampaignCreationWizard onCancel={() => setShowCreateWizard(false)} />
        ) : (
          <>
            {!isAuthenticated && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Connect your Meta account to access campaign features.</span>
                  <Link to="/meta-integration">
                    <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
                      Manage Integrations
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <MetaConnect />
              {isAuthenticated && <AdAccountSelector />}
            </div>
            
            {isAuthenticated && !hasPermissions && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>You don't have the necessary permissions to access ad campaigns.</span>
                  <Link to="/meta-integration">
                    <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
                      Configure Permissions
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            
            {isAuthenticated && hasPermissions && !hasAdAccount() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Please select an ad account to view and manage campaigns.</span>
                  <Link to="/meta-integration">
                    <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
                      Select Ad Account
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
            
            {isAuthenticated && hasPermissions && hasAdAccount() && (
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
      
      {/* Meta Connection Dialog that automatically shows when needed */}
      <MetaConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </AppLayout>
  );
};

export default Campaigns;
