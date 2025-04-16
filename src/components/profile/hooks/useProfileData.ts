import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useToast } from '@/hooks/use-toast';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

interface ProfileDataState {
  userData: any | null;
  isLoading: boolean;
  error: string | null;
  hasFallbackData: boolean;
}

export function useProfileData() {
  const [state, setState] = useState<ProfileDataState>({
    userData: null,
    isLoading: false,
    error: null,
    hasFallbackData: false
  });
  const { toast } = useToast();
  const { isAuthenticated, checkAuth } = useMetaConnection();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setState(prev => ({ ...prev, userData: null }));
        return;
      }
      
      const accessToken = metaAuthService.getAccessToken();
      
      if (!accessToken) {
        setState(prev => ({ ...prev, error: 'Not authenticated with Meta' }));
        return;
      }
      
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const data = await MetaApiService.fetchUserData(accessToken);
        
        // Check if we received fallback data with an error
        if (data.error || data.isFallback) {
          console.warn('[ProfileData] Using fallback user data due to API error');
          
          // Show a toast notification about the permission issue
          if (data.status === 403) {
            toast({
              title: "Permission Warning",
              description: "Limited Meta profile access. Some features may be restricted.",
              variant: "default",
              duration: 10000
            });
          }
          
          setState(prev => ({ 
            ...prev, 
            userData: data,
            isLoading: false,
            hasFallbackData: true,
            error: data.message || 'Limited profile access'
          }));
          
          return;
        }
        
        setState(prev => ({ 
          ...prev, 
          userData: data, 
          isLoading: false,
          hasFallbackData: false,
          error: null
        }));
      } catch (err) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to fetch user data', 
          isLoading: false 
        }));
        console.error(err);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated]);

  const handleDisconnect = () => {
    metaAuthService.logout();
    setState(prev => ({ ...prev, userData: null }));
    checkAuth(); // Update shared auth state
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };
  
  const handleRefreshToken = () => {
    // Clear token to force re-authentication
    metaAuthService.logout();
    
    toast({
      title: "Token Expired",
      description: "Please reconnect your Meta account with updated permissions."
    });
    
    // Trigger auth check which will show connection dialog
    checkAuth();
  };

  return {
    ...state,
    handleDisconnect,
    handleRefreshToken
  };
}
