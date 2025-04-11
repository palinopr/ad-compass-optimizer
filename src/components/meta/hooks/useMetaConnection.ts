
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';

export interface MetaConnectionState {
  isLoggedIn: boolean;
  userData: any | null;
  adAccounts: any[];
  errorMessage: string | null;
  isConnectionTesting: boolean;
}

export function useMetaConnection() {
  const [state, setState] = useState<MetaConnectionState>({
    isLoggedIn: false,
    userData: null,
    adAccounts: [],
    errorMessage: null,
    isConnectionTesting: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via our auth service
    const isAuthenticated = metaAuthService.isAuthenticated();
    if (isAuthenticated) {
      setState(prev => ({ ...prev, isLoggedIn: true }));
      const token = metaAuthService.getAccessToken();
      if (token) {
        testConnection(token);
      }
    }
  }, []);

  const testConnection = async (token: string) => {
    setState(prev => ({ ...prev, isConnectionTesting: true }));
    try {
      console.log("Testing Meta API connection...");
      const connectionResult = await MetaApiService.testConnection(token);
      
      if (connectionResult.success) {
        console.log("Connection test successful:", connectionResult);
        toast({
          title: "Connection Successful",
          description: `Connected to Meta as ${connectionResult.userName}`,
        });
        fetchInitialData(token);
      } else {
        console.error("Connection test failed:", connectionResult);
        setState(prev => ({ 
          ...prev, 
          errorMessage: connectionResult.error || "Connection failed",
          isConnectionTesting: false 
        }));
        
        toast({
          title: "Connection Failed",
          description: "Could not connect to Meta API. See details for more information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setState(prev => ({ 
        ...prev, 
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        isConnectionTesting: false 
      }));
    }
  };

  const fetchInitialData = async (token: string) => {
    try {
      const userData = await MetaApiService.fetchUserData(token);
      setState(prev => ({ ...prev, userData }));
      fetchAdAccounts(token);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setState(prev => ({ 
        ...prev, 
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
        isConnectionTesting: false 
      }));
    }
  };

  const fetchAdAccounts = async (token: string) => {
    try {
      const accounts = await MetaApiService.fetchAdAccounts(token);
      setState(prev => ({ 
        ...prev, 
        adAccounts: accounts,
        errorMessage: null,
        isConnectionTesting: false 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        errorMessage: error.message || "Could not fetch ad accounts",
        adAccounts: [],
        isConnectionTesting: false 
      }));
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setState(prev => ({ ...prev, isLoggedIn: true, userData }));
    
    // Fetch ad accounts with the newly stored token
    const token = metaAuthService.getAccessToken();
    if (token) {
      fetchAdAccounts(token);
    }
  };

  const handleLogout = () => {
    metaAuthService.logout();
    setState({
      isLoggedIn: false,
      userData: null,
      adAccounts: [],
      errorMessage: null,
      isConnectionTesting: false
    });
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  return {
    ...state,
    handleLoginSuccess,
    handleLogout,
    testConnection,
  };
}
