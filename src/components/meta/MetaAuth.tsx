
import React, { useState, useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ExternalLink, Key, Loader2, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  name?: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

const MetaAuth: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("facebook");
  const [manualToken, setManualToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
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
        fetchUserData(token);
        fetchAdAccounts(token);
      }
    }
  }, []);

  const responseFacebook = (response: FacebookAuthResponse) => {
    if (response.accessToken) {
      console.log('Facebook login success:', response);
      
      // Save token to our auth service
      metaAuthService.storeAccessToken(response.accessToken, response.userID);
      
      setIsLoggedIn(true);
      setUserData({
        name: response.name,
        email: response.email,
        picture: response.picture?.data.url
      });
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta account has been connected successfully."
      });
      
      // Fetch ad accounts
      fetchAdAccounts(response.accessToken);
    } else {
      console.error('Facebook login failed:', response);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Meta. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleManualTokenConnect = () => {
    if (!manualToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid access token",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    // Store the token
    metaAuthService.storeAccessToken(manualToken, 'manual_token_user');
    
    // Test the token by fetching user data
    fetchUserData(manualToken)
      .then(() => {
        setIsLoggedIn(true);
        toast({
          title: "Connected Successfully",
          description: "Your Meta access token has been connected successfully."
        });
        fetchAdAccounts(manualToken);
      })
      .catch(error => {
        console.error('Error with manual token:', error);
        metaAuthService.logout();
        toast({
          title: "Connection Failed",
          description: "The provided access token is invalid or has expired.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsConnecting(false);
      });
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      setUserData({
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      });

      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error",
        description: "Could not fetch user data. Your token might be invalid or expired.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const fetchAdAccounts = async (token: string) => {
    try {
      // First try with limited scope that doesn't require app review
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        // If we get an error about permissions, capture it
        setErrorMessage(data.error.message);
        setAdAccounts([]);
        // Show error dialog
        if (data.error.code === 200 || data.error.code === 190) {
          setShowDialog(true);
        }
        return;
      }
      
      if (data.data) {
        setAdAccounts(data.data);
        console.log('Ad accounts:', data.data);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      toast({
        title: "Error",
        description: "Could not fetch ad accounts. This may be due to permission restrictions.",
        variant: "destructive"
      });
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
                <div className="flex flex-col items-center py-4">
                  <p className="mb-6 text-center text-sm text-gray-500">
                    Connect your personal Facebook account for development. 
                    Note that during development we're using limited permissions.
                  </p>
                  <FacebookLogin
                    appId="2472498316312585"
                    autoLoad={false}
                    fields="name,email,picture"
                    scope="public_profile,email"
                    callback={responseFacebook}
                    cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center"
                    icon="fa-facebook"
                    textButton="Connect with Facebook"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="token">
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">
                    For development with ad data, use a System User Access Token from Meta Business Settings.
                  </p>
                  
                  <div className="space-y-2">
                    <label htmlFor="metaToken" className="text-sm font-medium">Access Token</label>
                    <Input
                      id="metaToken"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Enter your Meta access token"
                      type="password"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>
                      Generate a token in Meta Business Settings under System Users. 
                      For testing ad data, the token should have ads_read permission.
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleManualTokenConnect}
                    className="w-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Connect with Token
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <a 
                      href="https://developers.facebook.com/docs/marketing-api/system-users" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center"
                    >
                      Learn about System Users
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {userData?.picture && (
                <img 
                  src={userData.picture} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h3 className="font-medium">{userData?.name || 'Connected User'}</h3>
                <p className="text-sm text-gray-500">{userData?.email || 'Email not available'}</p>
                {errorMessage && (
                  <p className="text-xs text-red-500 mt-1">
                    Note: Limited access due to permissions
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Your Ad Accounts</h3>
              {adAccounts.length > 0 ? (
                <div className="space-y-2">
                  {adAccounts.map((account) => (
                    <div key={account.id} className="p-3 border rounded">
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm">Account ID: {account.account_id}</p>
                      <p className="text-sm">Status: {account.account_status === 1 ? 'Active' : 'Inactive'}</p>
                      <p className="text-sm">Currency: {account.currency}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">No Ad Accounts Available</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>{errorMessage || "No ad accounts found for this user."}</p>
                        <p className="mt-1">
                          For development, try using a System User Token with the appropriate permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleLogout}
            >
              Disconnect Account
            </Button>
          </div>
        )}
      </CardContent>

      {/* Permissions Error Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Restrictions</DialogTitle>
            <DialogDescription>
              Your app is currently using limited permissions during development. 
              To access ad data, you have two options:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Option 1: System User Token</h4>
              <p className="text-sm text-gray-500">
                For development, use a System User Token from Meta Business Settings
                with the appropriate permissions (ads_read, ads_management).
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Option 2: App Review</h4>
              <p className="text-sm text-gray-500">
                Submit your app for review by Meta to request the extended permissions.
                This is required for production apps using these permissions.
              </p>
            </div>

            <Button 
              className="w-full"
              onClick={() => {
                setShowDialog(false);
                setActiveTab("token");
                handleLogout();
              }}
            >
              Switch to Token Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MetaAuth;
