
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useToast } from '@/hooks/use-toast';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

interface ProfileDataState {
  userData: any | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfileData() {
  const [state, setState] = useState<ProfileDataState>({
    userData: null,
    isLoading: false,
    error: null
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
        setState(prev => ({ ...prev, userData: data, isLoading: false }));
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

  return {
    ...state,
    handleDisconnect
  };
}
