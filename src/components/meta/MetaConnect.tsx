
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
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

const MetaConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const isAuth = metaAuthService.isAuthenticated();
      setIsConnected(isAuth);
    };
    
    checkAuth();
    
    // Handle redirect from Meta OAuth
    const handleAuthRedirect = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const errorParam = params.get('error');
      
      if (errorParam) {
        setError('Authentication failed: ' + errorParam);
        toast({
          title: "Authentication Failed",
          description: `Error: ${errorParam}`,
          variant: "destructive"
        });
        return;
      }
      
      if (code) {
        setIsLoading(true);
        try {
          await metaAuthService.handleRedirect(code);
          setIsConnected(true);
          toast({
            title: "Connected Successfully",
            description: "Your Meta account is now connected.",
          });
          // Remove the code from the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setError('Failed to complete authentication');
          toast({
            title: "Connection Failed",
            description: "Could not complete Meta authentication",
            variant: "destructive"
          });
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleAuthRedirect();
  }, [location, toast]);
  
  const handleConnect = () => {
    setIsLoading(true);
    try {
      metaAuthService.initiateLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate authentication');
      setIsLoading(false);
      // Show the configuration dialog
      setIsDialogOpen(true);
    }
  };
  
  const handleDisconnect = () => {
    metaAuthService.logout();
    setIsConnected(false);
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
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
            <DialogTitle>Meta Configuration Required</DialogTitle>
            <DialogDescription>
              To connect your Meta account, you need to set up a Meta App ID first.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 p-3 rounded-md">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Follow these steps to set up a Meta App:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2 pl-1">
                  <li>Create a developer account at <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">developers.facebook.com</a></li>
                  <li>Create a new app in the Meta for Developers Console</li>
                  <li>Select "Business" as the app type</li>
                  <li>Add the "Marketing API" product to your app</li>
                  <li>Copy your App ID from the app settings</li>
                  <li>Open the <code className="bg-gray-100 p-1 rounded">src/services/MetaAuthService.ts</code> file</li>
                  <li>Update the <code className="bg-gray-100 p-1 rounded">appId</code> with your Meta App ID</li>
                </ol>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MetaConnect;
