
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useTokenValidation } from './useTokenValidation';
import { useUserData } from './useUserData';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

interface UseTokenConnectionOptions {
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

export function useTokenConnection({ onSuccess, onError }: UseTokenConnectionOptions) {
  const { manualToken, setManualToken, errorMessage, setErrorMessage, validateToken } = useTokenValidation();
  const { fetchUserData } = useUserData({ onError });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { checkAuth } = useMetaConnection();
  
  // Check if we have a token at initialization
  useEffect(() => {
    const hasToken = metaAuthService.isAuthenticated();
    if (hasToken) {
      console.log('Found existing Meta authentication');
      
      // Verify token is still valid
      const verifyExistingToken = async () => {
        const token = metaAuthService.getAccessToken();
        if (token) {
          try {
            const userData = await fetchUserData(token);
            onSuccess(userData);
          } catch (error) {
            // Silent fail - we don't want to show errors for automatic checks
            console.log('Failed to verify existing token:', error);
          }
        }
      };
      
      verifyExistingToken();
    } else {
      console.log('No existing Meta authentication found');
    }
  }, []);

  const connectWithToken = async (token: string, permissions: string[] = []) => {
    const { isValid, cleanedToken, errorMsg } = validateToken(token);
    
    if (!isValid) {
      onError(errorMsg || "Invalid token format");
      toast({
        title: "Error",
        description: errorMsg || "Invalid token format",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      // Clear previous auth data
      metaAuthService.logout();
      
      console.log(`Connecting with token (first 4 chars): ${cleanedToken.substring(0, 4)}..., permissions:`, permissions);
      
      // Ensure we have the necessary ad permissions
      if (!permissions.includes('ads_read')) {
        permissions.push('ads_read');
      }
      if (!permissions.includes('ads_management')) {
        permissions.push('ads_management');
      }
      
      // Test connection to validate token
      const connectionTest = await MetaApiService.testConnection(cleanedToken);
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Failed to validate token');
      }
      
      // After token is validated, fetch user data
      const userData = await fetchUserData(cleanedToken);
      
      metaAuthService.storeAccessToken(cleanedToken, userData.id || 'manual_token_user', 'token', permissions);
      
      // Update the shared auth state
      checkAuth();
      
      console.log('Token connection successful');
      
      onSuccess({
        ...userData,
        tokenPermissions: permissions
      });
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta access token has been connected successfully."
      });
    } catch (error) {
      console.error('Error with manual token:', error);
      metaAuthService.logout();
      
      let errorMsg = "The provided access token is invalid or has expired.";
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMsg = "Invalid token format or expired token (Error 400). Please verify your token and try again.";
        } else if (error.message.includes('401')) {
          errorMsg = "Authentication failed (Error 401). Your token has expired.";
        } else if (error.message.includes('403')) {
          errorMsg = "Permission denied (Error 403). Your token lacks necessary permissions.";
        } else if (error.message.includes('too short') || error.message.includes('format')) {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
      onError(errorMsg);
      
      toast({
        title: "Connection Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    manualToken,
    setManualToken,
    isConnecting,
    errorMessage,
    connectWithToken
  };
}
