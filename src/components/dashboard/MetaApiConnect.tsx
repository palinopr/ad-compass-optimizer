
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Key, AlertCircle } from 'lucide-react';

const MetaApiConnect = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

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
      // In a real implementation, you would validate the token and fetch initial data
      // This is simplified for demo purposes
      console.log("Connecting with token:", accessToken);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta Ads account was connected successfully",
      });
      
      // Here you would normally store the token securely and fetch initial data
      
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

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Facebook className="w-5 h-5 mr-2 text-meta-blue" />
          Connect Meta Marketing API
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                You can generate an access token in your Meta Business Manager. 
                Your token needs ads_read permission to access campaign data.
              </span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-meta-blue hover:bg-meta-dark"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="mr-2">Connecting...</span>
                  <span className="animate-spin">⏳</span>
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
      </CardContent>
    </Card>
  );
};

export default MetaApiConnect;
