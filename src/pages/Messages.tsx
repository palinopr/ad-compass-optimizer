import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

type ComponentState = 'loading' | 'not_authenticated' | 'no_ad_account' | 'ready';

const Messages = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth, showConnectionDialog } = useMetaConnection();
  const [componentState, setComponentState] = useState<ComponentState>('loading');
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const { toast } = useToast();
  
  const checkForAdAccount = useCallback(() => {
    try {
      console.log("Checking for ad accounts...");
      const selectedAccount = localStorage.getItem('selected_ad_account');
      if (selectedAccount && selectedAccount.length > 0) {
        console.log("Found selected ad account:", selectedAccount);
        return true;
      }
      
      const selectedAccountsStr = localStorage.getItem('selected_ad_accounts');
      if (!selectedAccountsStr) {
        console.log("No selected ad accounts found");
        return false;
      }
      
      const selectedAccounts = JSON.parse(selectedAccountsStr);
      const hasAccounts = Array.isArray(selectedAccounts) && selectedAccounts.length > 0;
      console.log("Selected ad accounts check result:", hasAccounts, selectedAccounts);
      return hasAccounts;
    } catch (e) {
      console.error('Error checking ad accounts:', e);
      localStorage.removeItem('selected_ad_accounts');
      return false;
    }
  }, []);
  
  const loadStoredAdAccounts = useCallback(() => {
    try {
      const accountsStr = localStorage.getItem('selected_ad_accounts');
      if (accountsStr) {
        const accounts = JSON.parse(accountsStr);
        if (Array.isArray(accounts) && accounts.length > 0) {
          console.log("Loaded stored ad accounts:", accounts);
          setAdAccounts(accounts);
          return true;
        }
      }
      
      const singleAccount = localStorage.getItem('selected_ad_account');
      if (singleAccount) {
        console.log("Loaded single stored ad account:", singleAccount);
        setAdAccounts([singleAccount]);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Error loading ad accounts:', e);
      return false;
    }
  }, []);
  
  const determineComponentState = useCallback(async () => {
    console.log("Determining component state...");
    
    const token = metaAuthService.getAccessToken();
    const isTokenValid = !!token && token.length > 50;
    console.log("Token validation check:", isTokenValid);
    
    if (!isTokenValid || !isAuthenticated) {
      console.log("Not authenticated, token valid:", isTokenValid, "isAuthenticated:", isAuthenticated);
      setComponentState('not_authenticated');
      return;
    }
    
    const hasAccount = checkForAdAccount();
    if (!hasAccount) {
      console.log("No ad account selected");
      setComponentState('no_ad_account');
      return;
    }
    
    loadStoredAdAccounts();
    
    console.log("All checks passed, component ready");
    setComponentState('ready');
  }, [isAuthenticated, checkForAdAccount, loadStoredAdAccounts]);
  
  useEffect(() => {
    console.log("Messages page mounted");
    
    checkAuth();
    
    determineComponentState();
    
    const interval = setInterval(() => {
      console.log("Running periodic state check");
      determineComponentState();
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [checkAuth, determineComponentState]);
  
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
    determineComponentState();
  }, [isAuthenticated, determineComponentState]);
  
  const handleConnectClick = () => {
    console.log("Connect button clicked, forcing connection dialog");
    
    localStorage.setItem('show_meta_connection', 'true');
    sessionStorage.setItem('show_meta_connection', 'true');
    
    toast({
      title: "Connection Required",
      description: "Please connect your Meta account to access messages",
    });
    
    showConnectionDialog();
    
    setTimeout(() => {
      window.location.href = '/meta-integration?tab=accounts';
    }, 1000);
  };
  
  const handleSelectAdAccount = () => {
    navigate('/meta-integration?tab=accounts');
    toast({
      title: "Select Ad Account",
      description: "Please select an ad account to view messages",
    });
  };

  const renderContent = () => {
    switch (componentState) {
      case 'loading':
        return (
          <Alert className="bg-slate-50 border-slate-200">
            <Loader2 className="h-4 w-4 text-slate-600 animate-spin" />
            <AlertDescription className="text-slate-700">
              Checking authentication status...
            </AlertDescription>
          </Alert>
        );
        
      case 'not_authenticated':
        return (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-700 flex items-center justify-between w-full">
              <span>Not authenticated with Meta. Please connect your account.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-100 hover:bg-amber-200 ml-4"
                onClick={handleConnectClick}
              >
                Connect Now
              </Button>
            </AlertDescription>
          </Alert>
        );
        
      case 'no_ad_account':
        return (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-700 flex items-center justify-between w-full">
              <span>Please select an ad account to view message data.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-amber-100 hover:bg-amber-200 ml-4"
                onClick={handleSelectAdAccount}
              >
                Select Account
              </Button>
            </AlertDescription>
          </Alert>
        );
        
      case 'ready':
        return (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Messages feature is coming soon. This page will display your ad messages and conversations.
            </AlertDescription>
          </Alert>
        );
        
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Messages
          </h1>
          <p className="text-muted-foreground">View and manage your Meta ad messages and conversations</p>
        </div>
        
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
            
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium mb-2">Connection Status</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Authentication:</div>
                <div className={isAuthenticated ? "text-green-600" : "text-red-600"}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </div>
                
                <div>Ad Account:</div>
                <div className={adAccounts.length > 0 ? "text-green-600" : "text-red-600"}>
                  {adAccounts.length > 0 ? `Selected (${adAccounts.length})` : "Not Selected"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Messages;
