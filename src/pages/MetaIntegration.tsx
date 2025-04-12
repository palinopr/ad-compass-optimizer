
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { metaAuthService } from '@/services/MetaAuthService';
import MetaConnectCard from '@/components/meta/MetaConnectCard';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ShieldAlert, RefreshCw } from 'lucide-react';
import MetaConnectionFlow from '@/components/meta/MetaConnectionFlow';
import { useToast } from '@/hooks/use-toast';
import TokenPermissionsList from '@/components/meta/TokenPermissionsList';

const MetaIntegration = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAdsPermission, setHasAdsPermission] = useState(false);
  const { toast } = useToast();

  const checkAuthStatus = () => {
    const authenticated = metaAuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const permissions = metaAuthService.getPermissions();
      const hasPermission = permissions.some(p => 
        p === 'ads_management' || p === 'ads_read'
      );
      setHasAdsPermission(hasPermission);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleDisconnect = () => {
    metaAuthService.logout();
    setIsAuthenticated(false);
    setHasAdsPermission(false);
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      checkAuthStatus();
      setIsRefreshing(false);
      
      toast({
        title: "Refreshed",
        description: "Connection status has been refreshed."
      });
    }, 500);
  };

  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    return selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meta Integration</h1>
            <p className="text-muted-foreground">
              Manage your Meta Business accounts, pages, and API connections
            </p>
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {isAuthenticated && !hasAdsPermission && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have the necessary permissions to access ad campaigns. Please reconnect with permissions for ads_read or ads_management.
            </AlertDescription>
          </Alert>
        )}
        
        {isAuthenticated && hasAdsPermission && !hasAdAccount() && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please select an ad account to manage campaigns and view insights.
            </AlertDescription>
          </Alert>
        )}
        
        {isAuthenticated && hasAdsPermission && hasAdAccount() && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Your Meta account is fully connected with required permissions and ad accounts.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Account Connection</TabsTrigger>
            <TabsTrigger value="flow">Integration Flow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetaConnectCard />
              {isAuthenticated && <AdAccountSelector />}
            </div>
          </TabsContent>
          
          <TabsContent value="flow" className="space-y-4 mt-4">
            <MetaConnectionFlow />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Permission Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isAuthenticated ? (
                    <>
                      <TokenPermissionsList />
                      
                      <h3 className="font-medium mt-4">Connection Details</h3>
                      <ConnectionDetails />
                    </>
                  ) : (
                    <p>Please connect your Meta account to manage permission settings.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

const ConnectionDetails = () => {
  const userId = metaAuthService.getUserId() || 'Unknown';
  const tokenSource = metaAuthService.getTokenSource();
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium">User ID:</div>
        <div>{userId}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium">Connection Method:</div>
        <div className="capitalize">{tokenSource}</div>
      </div>
    </div>
  );
};

export default MetaIntegration;
