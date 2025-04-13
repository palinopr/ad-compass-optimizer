
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Facebook, Key } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import MetaConnectionDialog from './MetaConnectionDialog';
import { useMetaConnection } from './SharedMetaConnectionProvider';

const MetaConnectCard = () => {
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [effectiveIsConnected, setEffectiveIsConnected] = useState(false);

  // Use direct token check which is more reliable
  useEffect(() => {
    const checkConnection = () => {
      const token = metaAuthService.getAccessToken();
      const directAuthCheck = token && token.length >= 50;
      
      console.log('MetaConnectCard - Auth state check:', 
        directAuthCheck ? 'Connected' : 'Not connected',
        'Context state:', isAuthenticated ? 'Connected' : 'Not connected'
      );
      
      setEffectiveIsConnected(directAuthCheck);
      
      // If there's a mismatch, trigger a context refresh
      if (directAuthCheck !== isAuthenticated) {
        console.log('Auth state mismatch in MetaConnectCard, refreshing...');
        checkAuth();
      }
    };
    
    checkConnection();
    
    // Set up a listener for storage changes (like token updates)
    const handleStorageChange = () => {
      checkConnection();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, checkAuth]);

  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful, user data:', userData);
    setEffectiveIsConnected(true);
    setShowConnectionDialog(false);
    
    // Force auth state refresh
    setTimeout(() => checkAuth(), 500);
  };

  const handleConnectionError = () => {
    // Just close the dialog but don't update auth state
    setShowConnectionDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Facebook className="w-5 h-5 mr-2 text-meta-blue" />
          Connect Meta Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {effectiveIsConnected ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Connected to Meta</span>
            </div>
            <p className="text-sm text-gray-500">
              Your Meta account is connected. You can now access campaign data and manage your ad accounts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Connect your Meta account to access campaign data and manage your ad accounts.
            </p>
            <Button 
              className="w-full bg-meta-blue hover:bg-meta-dark"
              onClick={() => setShowConnectionDialog(true)}
            >
              <Facebook className="w-4 h-4 mr-2" />
              Connect with Facebook
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Meta Connection Dialog that automatically shows when needed */}
      <MetaConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </Card>
  );
};

export default MetaConnectCard;
