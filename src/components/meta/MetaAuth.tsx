
import React, { useState, useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

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
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Could not fetch user data. Your token might be invalid or expired.",
        variant: "destructive"
      });
    }
  };

  const fetchAdAccounts = async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch ad accounts');
      }
      
      if (data.data) {
        setAdAccounts(data.data);
        console.log('Ad accounts:', data.data);
      }
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      toast({
        title: "Error",
        description: "Could not fetch ad accounts. Make sure your token has ads_management and ads_read permissions.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    metaAuthService.logout();
    setIsLoggedIn(false);
    setUserData(null);
    setAdAccounts([]);
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meta Ads Account Connection</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <div className="flex flex-col items-center">
            <p className="mb-4">Connect your Facebook account to access your ad accounts and campaign data</p>
            <FacebookLogin
              appId="2472498316312585" // Your Facebook App ID
              autoLoad={false}
              fields="name,email,picture"
              scope="public_profile,email,ads_management,ads_read,business_management"
              callback={responseFacebook}
              cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center"
              icon="fa-facebook"
              textButton="Connect with Facebook"
            />
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
                <p className="text-sm text-gray-500">No ad accounts found</p>
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
    </Card>
  );
};

export default MetaAuth;
