
import { useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  name?: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  status?: string;
  error?: string;
  hasBusinessAccess?: boolean;
}

export function useResponseHandler(onLoginSuccess: (userData: any) => void) {
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const responseFacebook = (response: FacebookAuthResponse) => {
    console.log('Facebook login response:', response);
    setIsConnecting(false);
    
    if (response.accessToken) {
      console.log('Facebook login success with token:', response.accessToken.substring(0, 10) + '...');
      
      metaAuthService.storeAccessToken(response.accessToken, response.userID, 'facebook');
      
      const userData = {
        name: response.name,
        email: response.email,
        picture: response.picture?.data.url,
        hasBusinessAccess: response.hasBusinessAccess
      };
      
      onLoginSuccess(userData);
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta account has been connected successfully with full permissions."
      });
      
      setLoginError(null);
    } else {
      console.error('Facebook login failed:', response);
      
      if (response.status === 'unknown') {
        setLoginError('Login was cancelled or failed');
      } else if (response.error) {
        setLoginError(response.error);
      } else {
        setLoginError('Could not connect to Meta. Please try again.');
      }
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to Meta. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFacebookError = (error: any) => {
    console.error('Facebook Login Error:', error);
    setIsConnecting(false);
    
    if (error) {
      setLoginError(error.message || 'Failed to connect with Facebook');
      
      toast({
        title: "Facebook Login Error",
        description: error.message || "An error occurred with Facebook Login",
        variant: "destructive"
      });
    }
  };

  return { 
    loginError, 
    isConnecting, 
    setIsConnecting, 
    responseFacebook, 
    handleFacebookError,
    setLoginError
  };
}
