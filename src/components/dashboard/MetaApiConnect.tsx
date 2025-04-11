
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Key, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';

const MetaApiConnect = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    setIsConnected(metaAuthService.isAuthenticated());
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Meta Marketing API access token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Store the token
      metaAuthService.storeAccessToken(accessToken);
      setIsConnected(true);
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta Ads account was connected successfully",
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Meta Marketing API. Please check your access token.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    metaAuthService.logout();
    setIsConnected(false);
    setAccessToken('');
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Facebook className="w-5 h-5 mr-2 text-meta-blue" />
          Connect Meta Marketing API
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Connected to Meta Marketing API</span>
            </div>
            <p className="text-sm text-gray-500">
              Your Meta API access token has been stored. You can now access campaign data and analytics.
            </p>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
            >
              Disconnect API
            </Button>
          </div>
        ) : (
          <form onSubmit={handleConnect}>
            <div className="space-y-4">
              <div>
                <label htmlFor="accessToken" className="text-sm font-medium block mb-1">
                  API Access Token
                </label>
                <Input
                  id="accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your Meta Marketing API access token"
                  className="w-full"
                />
              </div>
              
              <div className="text-xs flex items-start space-x-2 text-gray-500">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  You can generate an access token in Meta Business Settings under System Users. 
                  Your token needs ads_management and ads_read permissions.
                </span>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-meta-blue hover:bg-meta-dark"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Connect to Meta API
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaApiConnect;
