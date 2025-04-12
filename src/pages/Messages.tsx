
import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Messages = () => {
  const { isAuthenticated, hasPermissions, checkAuth } = useMetaConnection();
  
  // Check authentication status when component mounts
  useEffect(() => {
    // Immediate auth check
    checkAuth();
    
    // Clear any "show connection" flags that might be set
    localStorage.removeItem('show_meta_connection');
    sessionStorage.removeItem('show_meta_connection');
  }, [checkAuth]);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    return selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0;
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
