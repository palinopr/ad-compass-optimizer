
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { validateTokenFormat, cleanToken } from '@/utils/tokenUtils';

interface UseMetaTokenConnectionOptions {
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

export function useMetaTokenConnection({ onSuccess, onError }: UseMetaTokenConnectionOptions) {
  const [manualToken, setManualToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = async (token: string) => {
    try {
      const validation = validateTokenFormat(token);
      if (!validation.valid) {
        throw new Error(validation.reason || "Invalid token format");
      }
      
      console.log(`Testing token validity: ${token.substring(0, 4)}...${token.substring(token.length - 4)} (length: ${token.length})`);
      
      // First test the connection to check if the token is valid
      const connectionTest = await MetaApiService.testConnection(token);
      
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Failed to validate token');
      }
      
      if (connectionTest.userId && connectionTest.userName) {
        console.log('Using user data from connection test');
        return {
          id: connectionTest.userId,
          name: connectionTest.userName,
          hasAdAccess: connectionTest.hasAdAccess || false
        };
      }
      
      console.log('Token test passed, fetching user data');
      const response = await fetch(
        `https://graph.facebook.com/v17.0/me?fields=id,name,email,picture&access_token=${token}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching user data:', errorText);
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      console.log('Successfully fetched user data');
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMsg = `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setErrorMessage(errorMsg);
      onError(errorMsg);
      throw error;
    }
  };

  const connectWithToken = async (token: string, permissions: string[] = []) => {
    const cleanedToken = cleanToken(token);
    
    const validation = validateTokenFormat(cleanedToken);
    if (!validation.valid) {
      const errorMsg = validation.reason || "Please enter a valid access token";
      setErrorMessage(errorMsg);
      onError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
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
