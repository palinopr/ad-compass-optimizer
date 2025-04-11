
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';

// Import our new components
import FacebookLoginTab from './FacebookLoginTab';
import TokenInputTab from './TokenInputTab';
import ConnectedAccountInfo from './ConnectedAccountInfo';
import PermissionsErrorDialog from './PermissionsErrorDialog';

const MetaAuth: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("facebook");
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via our auth service
    const isAuthenticated = metaAuthService.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(true);
      const token = metaAuthService.getAccessToken();
      if (token) {
        fetchInitialData(token);
      }
    }
  }, []);

  const fetchInitialData = async (token: string) => {
    try {
      const userData = await MetaApiService.fetchUserData(token);
      setUserData(userData);
      fetchAdAccounts(token);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchAdAccounts = async (token: string) => {
    try {
      const accounts = await MetaApiService.fetchAdAccounts(token);
      setAdAccounts(accounts);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.message || "Could not fetch ad accounts");
      setAdAccounts([]);
      
      // Show error dialog for permission issues
      if (error.message?.includes("permission") || 
          error.message?.includes("access token") ||
          error.message?.includes("invalid")) {
        setShowDialog(true);
      }
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setIsLoggedIn(true);
    setUserData(userData);
    
    // Fetch ad accounts with the newly stored token
    const token = metaAuthService.getAccessToken();
    if (token) {
      fetchAdAccounts(token);
    }
  };

  const handleLogout = () => {
    metaAuthService.logout();
    setIsLoggedIn(false);
    setUserData(null);
    setAdAccounts([]);
    setErrorMessage(null);
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  const handleSwitchToToken = () => {
    setShowDialog(false);
    setActiveTab("token");
    handleLogout();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meta Ads Account Connection</CardTitle>
        <CardDescription>
          Connect to Meta to manage your ad campaigns and access advertising data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="facebook">Facebook Login</TabsTrigger>
                <TabsTrigger value="token">System User Token</TabsTrigger>
              </TabsList>
              
              <TabsContent value="facebook">
                <FacebookLoginTab onLoginSuccess={handleLoginSuccess} />
              </TabsContent>
              
              <TabsContent value="token">
                <TokenInputTab onTokenSuccess={handleLoginSuccess} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <ConnectedAccountInfo 
            userData={userData}
            adAccounts={adAccounts}
            errorMessage={errorMessage}
            onLogout={handleLogout}
          />
        )}
      </CardContent>

      <PermissionsErrorDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSwitchToToken={handleSwitchToToken}
      />
    </Card>
  );
};

export default MetaAuth;
