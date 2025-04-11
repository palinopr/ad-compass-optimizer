
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

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
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      return {
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
    if (!token.trim()) {
      const errorMsg = "Please enter a valid access token";
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
      // Store the token with permissions
      metaAuthService.storeAccessToken(token, 'manual_token_user', 'token', permissions);
      
      // Test the token by fetching user data
      const userData = await fetchUserData(token);
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
      const errorMsg = "The provided access token is invalid or has expired.";
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
