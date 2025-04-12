
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const { isAuthenticated, hasPermissions, checkAuth, showConnectionDialog } = useMetaConnection();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [selectedAdAccounts, setSelectedAdAccounts] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Check authentication status when component mounts
  useEffect(() => {
    // First check if there's any token existing
    const token = localStorage.getItem('meta_access_token');
    
    // Force auth check with a small delay to ensure it runs after initial render
    setTimeout(() => {
      checkAuth();
      setCheckedAuth(true);
      
      // Also check for ad accounts
      const adAccounts = localStorage.getItem('selected_ad_accounts');
      if (adAccounts) {
        try {
          setSelectedAdAccounts(JSON.parse(adAccounts));
        } catch (e) {
          console.error('Error parsing ad accounts:', e);
        }
      }
    }, 300); // Use a slightly longer delay to ensure all auth checks complete
    
    // Clear any "show connection" flags that might be set
    localStorage.removeItem('show_meta_connection');
    sessionStorage.removeItem('show_meta_connection');
    
    // Set up an interval to periodically check auth status
    const interval = setInterval(() => {
      checkAuth();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkAuth]);
  
  // Check for auth changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authenticated in Messages.tsx. Checking for ad accounts...');
      // When authenticated, check for selected ad accounts
      const adAccounts = localStorage.getItem('selected_ad_accounts');
      if (adAccounts) {
        try {
          setSelectedAdAccounts(JSON.parse(adAccounts));
        } catch (e) {
          console.error('Error parsing ad accounts:', e);
        }
      }
    } else {
      console.log('Not authenticated in Messages.tsx');
      setSelectedAdAccounts([]);
    }
  }, [isAuthenticated]);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    return selectedAdAccounts.length > 0;
  };

  const handleConnectClick = () => {
    // Update both localStorage and sessionStorage to force connection dialog
    localStorage.setItem('show_meta_connection', 'true');
    sessionStorage.setItem('show_meta_connection', 'true');
    
    // Then call the provider method
    showConnectionDialog();
    
    toast({
      title: "Connection Required",
      description: "Please connect your Meta account to access messages",
    });
    
    // Force reload after a short delay to ensure dialog shows
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">View and manage your Meta ad messages and conversations</p>
        </div>
        
        {isAuthenticated && hasPermissions && hasAdAccount() && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Messages feature is coming soon. This page will display your ad messages and conversations.
            </AlertDescription>
          </Alert>
        )}
        
        {(!isAuthenticated || !checkedAuth) && (
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
        )}
        
        {isAuthenticated && !hasAdAccount() && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Please select an ad account to view message data.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetaConnect />
          {isAuthenticated && <AdAccountSelector />}
        </div>
        
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
