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
import MetaConnectionStatus from '@/components/meta/MetaConnectionStatus';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import DirectApiTest from '@/components/meta/DirectApiTest';

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

export default function MetaIntegration() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, hasPermissions, checkAuth } = useMetaConnection();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['accounts', 'flow', 'settings', 'diagnostics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleDisconnect = () => {
    metaAuthService.logout();
    checkAuth();
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      checkAuth();
      setIsRefreshing(false);
      
      toast({
        title: "Refreshed",
        description: "Connection status has been refreshed."
      });
    }, 500);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
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

        <div className="mb-4">
          <MetaConnectionStatus />
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Account Connection</TabsTrigger>
            <TabsTrigger value="flow">Integration Flow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
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
          
          <TabsContent value="diagnostics" className="space-y-4 mt-4">
            <DirectApiTest />
            
            <Card>
              <CardHeader>
                <CardTitle>API Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">Common Issues</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <strong>Invalid Token Format</strong>: Ensure your token doesn't contain any spaces or special characters.
                    </li>
                    <li>
                      <strong>Expired Token</strong>: Meta tokens typically expire after 60 days. Check the token age in the diagnostics.
                    </li>
                    <li>
                      <strong>Missing Permissions</strong>: Your token needs at least 'ads_management' and 'ads_read' permissions.
                    </li>
                    <li>
                      <strong>CORS Issues</strong>: These occur when the API server doesn't allow requests from your domain.
                    </li>
                  </ul>
                  
                  <h3 className="font-medium mt-4">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Generate a fresh System User Token with the correct permissions.</li>
                    <li>Use the diagnostic tools to identify the exact issue.</li>
                    <li>Check the browser console for any errors.</li>
                    <li>Try the Direct API Test above to test the API connection.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
