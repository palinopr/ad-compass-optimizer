
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle, XCircle, Loader2, Info, Key, ExternalLink } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const MetaConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const isAuth = metaAuthService.isAuthenticated();
      setIsConnected(isAuth);
    };
    
    checkAuth();
  }, []);
  
  const handleConnect = () => {
    setIsDialogOpen(true);
  };
  
  const handleDisconnect = () => {
    metaAuthService.logout();
    setIsConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  const handleTokenSubmit = () => {
    if (!accessToken.trim()) {
      setError("Please enter a valid access token");
      return;
    }

    setIsLoading(true);
    try {
      metaAuthService.storeAccessToken(accessToken);
      setIsConnected(true);
      setIsDialogOpen(false);
      setError(null);
      toast({
        title: "Connected Successfully",
        description: "Your Meta account is now connected.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect with provided token');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Meta Ads Account Connection</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Connected to Meta Ads</span>
              </div>
              <p className="text-sm text-slate-500">
                Your Meta account is connected. You can now create and manage campaigns, view insights, and optimize your ads.
              </p>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && !isDialogOpen && (
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                  <XCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-sm text-slate-500">
                Connect your Meta Ads account to access campaign data and manage your ad campaigns.
              </p>
              <Button 
                className="bg-meta-blue hover:bg-meta-dark" 
                onClick={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Connect with Access Token
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Meta Ads Account</DialogTitle>
            <DialogDescription>
              Enter your Meta Ads access token to connect your account
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {error && (
              <div className="flex items-start space-x-3 bg-red-50 border border-red-200 p-3 rounded-md">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}
            
            <div>
              <label htmlFor="accessToken" className="text-sm font-medium block mb-1">
                Meta Ads Access Token
              </label>
              <Input
                id="accessToken"
                type="password" 
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter your access token"
                className="w-full"
              />
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="text-sm font-medium">How to get your Meta access token:</div>
              
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2 pl-1">
                <li>Go to the <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Meta Business Manager <ExternalLink className="h-3 w-3 ml-0.5" /></a></li>
                <li>In the left sidebar, click on <strong>System Users</strong></li>
                <li>Select an existing System User or create a new one</li>
                <li>Click <strong>Generate New Token</strong></li>
                <li>Select your Ad Account and check the permissions:
                  <ul className="list-disc list-inside ml-4 mt-1 text-sm text-gray-600">
                    <li>ads_management</li>
                    <li>ads_read</li>
                  </ul>
                </li>
                <li>Set an expiration date (90 days recommended)</li>
                <li>Copy the generated token and paste it above</li>
              </ol>
              
              <div className="pt-2">
                <a 
                  href="https://developers.facebook.com/docs/marketing-api/overview/authorization#access-token" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-flex items-center"
                >
                  Learn more about Meta access tokens <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-meta-blue hover:bg-meta-dark" 
              onClick={handleTokenSubmit}
              disabled={isLoading}
            >
              Connect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MetaConnect;
