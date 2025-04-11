
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const MetaConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err) {
      setError('Failed to initiate authentication');
      setIsLoading(false);
      toast({
        title: "Connection Failed",
        description: "Could not initiate Meta authentication",
        variant: "destructive"
      });
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
            {error && (
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
  );
};

export default MetaConnect;
