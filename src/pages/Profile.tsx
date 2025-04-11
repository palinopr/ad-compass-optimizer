
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, FileText, ShareIcon, Calendar, Settings, Shield } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = metaAuthService.getAccessToken();
      
      if (!accessToken) {
        setError('Not authenticated with Meta');
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await MetaApiService.fetchUserData(accessToken);
        setUserData(data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleDisconnect = () => {
    metaAuthService.logout();
    setUserData(null);
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and Meta connections.
          </p>
        </div>
        
        <Tabs defaultValue="account">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="meta">Meta Connection</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  User Profile
                </CardTitle>
                <CardDescription>Update your account preferences and personal information.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData ? (
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-4">
                        {userData.picture ? (
                          <img 
                            src={userData.picture} 
                            alt="Profile Picture" 
                            className="h-16 w-16 rounded-full" 
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-lg">{userData.name || 'Anonymous User'}</h3>
                          <p className="text-sm text-gray-500">{userData.email || 'No email available'}</p>
                        </div>
                      </div>

                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Meta App ID</h4>
                          <p className="text-sm">1356517842213704</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Connection Type</h4>
                          <p className="text-sm">{metaAuthService.getTokenSource()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      {isLoading ? (
                        <p>Loading user data...</p>
                      ) : error ? (
                        <div>
                          <p className="text-red-500">{error}</p>
                          <p className="mt-2">Please connect your Meta account to view profile data.</p>
                        </div>
                      ) : (
                        <p>No user data available. Please connect your Meta account.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meta" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShareIcon className="w-5 h-5 mr-2" />
                  Meta Connection
                </CardTitle>
                <CardDescription>Manage your connection to the Meta Marketing API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData ? (
                    <div className="space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-green-700 flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Connected as {userData.name}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Meta User ID</h4>
                          <p className="text-sm">{metaAuthService.getUserId() || 'Not available'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Connection Method</h4>
                          <p className="text-sm capitalize">{metaAuthService.getTokenSource()}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Ad Account Selection</h4>
                        <AdAccountSelector />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="destructive" 
                          onClick={handleDisconnect}
                        >
                          Disconnect Meta Account
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>You are not connected to the Meta Marketing API.</p>
                      <p className="text-sm text-gray-500">Connect your Meta account to access ad data and manage campaigns.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Manage your privacy and data preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Your data is handled in accordance with our 
                    <a href="/privacy-policy" className="text-blue-600 hover:underline mx-1">Privacy Policy</a> 
                    and 
                    <a href="/terms-of-service" className="text-blue-600 hover:underline mx-1">Terms of Service</a>.
                  </p>
                  
                  <p>
                    To request deletion of your account data, please visit our 
                    <a href="/data-deletion" className="text-blue-600 hover:underline mx-1">Data Deletion</a> 
                    page or contact us at 
                    <a href="mailto:contact@outletmedia.net" className="text-blue-600 hover:underline mx-1">contact@outletmedia.net</a>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
