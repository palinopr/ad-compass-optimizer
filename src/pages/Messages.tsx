
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

const Messages = () => {
  const { isAuthenticated, checkAuth, showConnectionDialog } = useMetaConnection();
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Function to check if there's a selected ad account
  const hasAdAccount = () => {
    try {
      const selectedAccountsStr = localStorage.getItem('selected_ad_accounts');
      if (!selectedAccountsStr) return false;
      
      const selectedAccounts = JSON.parse(selectedAccountsStr);
      return Array.isArray(selectedAccounts) && selectedAccounts.length > 0;
    } catch (e) {
      console.error('Error checking ad accounts:', e);
      return false;
    }
  };
  
  // Initial authentication and data loading
  useEffect(() => {
    console.log("Messages page mounted, checking auth status");
    
    const checkAuthentication = async () => {
      // Force immediate auth check
      await checkAuth();
      
      // Check if we have an access token
      const token = metaAuthService.getAccessToken();
      const isTokenValid = !!token && token.length > 50;
      
      console.log("Token exists:", isTokenValid);
      console.log("Is authenticated according to provider:", isAuthenticated);
      
      if (isTokenValid) {
        // Check for ad accounts regardless of isAuthenticated state
        const accountsStr = localStorage.getItem('selected_ad_accounts');
        if (accountsStr) {
          try {
            const accounts = JSON.parse(accountsStr);
            console.log("Found stored ad accounts:", accounts);
            setAdAccounts(accounts);
          } catch (e) {
            console.error('Error parsing ad accounts:', e);
          }
        } else {
          console.log("No ad accounts found in storage");
        }
      } else {
        console.log("No valid token found, will prompt for connection");
        // If there's no valid token, clear any selected ad accounts
        setAdAccounts([]);
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
    
    // Set up periodic check
    const interval = setInterval(() => {
      console.log("Periodic auth check");
      checkAuth();
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [checkAuth]);
  
  // Listen for changes to isAuthenticated
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
    
    // When authentication changes, check for ad accounts
    if (isAuthenticated) {
      const accountsStr = localStorage.getItem('selected_ad_accounts');
      if (accountsStr) {
        try {
          const accounts = JSON.parse(accountsStr);
          setAdAccounts(accounts);
        } catch (e) {
          console.error('Error parsing ad accounts:', e);
        }
      }
    } else {
      // Clear ad accounts if not authenticated
      setAdAccounts([]);
    }
  }, [isAuthenticated]);
  
  const handleConnectClick = () => {
    console.log("Connect button clicked, forcing connection dialog");
    
    // First, we'll directly set the flag to ensure dialog shows
    localStorage.setItem('show_meta_connection', 'true');
    sessionStorage.setItem('show_meta_connection', 'true');
    
    // Now call the provider method
    showConnectionDialog();
    
    // Notify user
    toast({
      title: "Connection Required",
      description: "Please connect your Meta account to access messages",
    });
    
    // Force page reload after a short delay to ensure dialog shows
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  // Determine content display based on authentication and ad account status
  const renderContent = () => {
    if (isLoading) {
      return (
        <Alert className="bg-slate-50 border-slate-200">
          <Info className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-700">
            Checking authentication status...
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Not authenticated with Meta. Please connect your account.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 bg-amber-100 hover:bg-amber-200"
              onClick={handleConnectClick}
            >
              Connect Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!hasAdAccount()) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Please select an ad account to view message data.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Messages feature is coming soon. This page will display your ad messages and conversations.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">View and manage your Meta ad messages and conversations</p>
        </div>
        
        {/* Auth & ad account status display */}
        {renderContent()}
        
        <Card>
          <CardHeader>
            <CardTitle>Messages & Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is currently in development. Once implemented, you'll be able to view and respond
              to messages related to your Meta advertising campaigns.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Messages;
