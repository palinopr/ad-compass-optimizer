
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle, XCircle, Loader2, Info, Key } from 'lucide-react';
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
                Connect your Meta Ads account to access all your ad accounts, create campaigns, and optimize your event promotions.
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
                    <Facebook className="mr-2 h-4 w-4" />
                    Connect Meta Account
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Meta Ads</DialogTitle>
            <DialogDescription>
              Enter your Meta Ads access token to connect your account directly.
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
            
            <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 p-3 rounded-md">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">How to get your access token:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2 pl-1">
                  <li>Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Business Settings</a></li>
                  <li>Click on "System Users" in the left sidebar</li>
                  <li>Create a new System User or select an existing one</li>
                  <li>Go to the "Generate New Token" section</li>
                  <li>Select your Ad account and request "ads_management" and "ads_read" permissions</li>
                  <li>Copy the generated token and paste it above</li>
                </ol>
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Connect Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MetaConnect;
