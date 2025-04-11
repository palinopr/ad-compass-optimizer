
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, CheckCircle, XCircle, Loader2, Key } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import MetaConnectionDialog from './MetaConnectionDialog';

const MetaConnectCard: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
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

  const handleConnectionSuccess = () => {
    setIsConnected(true);
    setIsDialogOpen(false);
    setError(null);
    toast({
      title: "Connected Successfully",
      description: "Your Meta account is now connected.",
    });
  };

  const handleConnectionError = (errorMsg: string) => {
    setError(errorMsg);
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
      
      <MetaConnectionDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </>
  );
};

export default MetaConnectCard;
