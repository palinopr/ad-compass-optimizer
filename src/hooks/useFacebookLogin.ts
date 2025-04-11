
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';

interface FacebookAuthResponse {
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
}

export interface UseFacebookLoginResult {
  isScriptLoaded: boolean;
  loginError: string | null;
  isConnecting: boolean;
  handleManualLoginClick: () => void;
  handleAdvancedPermissionsLogin: () => void;
  responseFacebook: (response: FacebookAuthResponse) => void;
  handleFacebookError: (error: any) => void;
}

export function useFacebookLogin(onLoginSuccess: (userData: any) => void) {
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    console.log("Initializing Facebook SDK");
    if (window.FB) {
      console.log("Facebook SDK already loaded");
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Facebook SDK loaded");
      window.FB?.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_APP_CONFIG.version
      });
      setIsScriptLoaded(true);
    };

    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const responseFacebook = (response: FacebookAuthResponse) => {
    console.log('Facebook login response:', response);
    setIsConnecting(false);
    
    if (response.accessToken) {
      console.log('Facebook login success with token:', response.accessToken.substring(0, 10) + '...');
      
      metaAuthService.storeAccessToken(response.accessToken, response.userID, 'facebook');
      
      const userData = {
        name: response.name,
        email: response.email,
        picture: response.picture?.data.url
      };
      
      onLoginSuccess(userData);
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta account has been connected successfully."
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
      if (error.message && error.message.includes('Feature Unavailable')) {
        setLoginError(
          'Facebook Login feature is unavailable. Your Facebook App needs to complete the "Authenticate and request data from users" use case and be switched to Live mode.'
        );
      } else if (error.message && error.message.includes('Invalid Scopes')) {
        setLoginError(
          'Permission error: Advanced permissions like ads_management require Meta App Review. Currently using basic permissions only.'
        );
      } else {
        setLoginError(error.message || 'Failed to connect with Facebook');
      }
      
      toast({
        title: "Facebook Login Error",
        description: error.message || "An error occurred with Facebook Login",
        variant: "destructive"
      });
    }
  };

  const handleManualLoginClick = () => {
    console.log("Manual Facebook login clicked");
    setIsConnecting(true);
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("Manual FB.login response:", response);
          if (response.authResponse) {
            responseFacebook({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled');
            setIsConnecting(false);
          }
        },
        { scope: FACEBOOK_APP_CONFIG.scope }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleAdvancedPermissionsLogin = () => {
    console.log("Attempting login with advanced permissions");
    setIsConnecting(true);
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("Advanced permissions FB.login response:", response);
          if (response.authResponse) {
            responseFacebook({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled or advanced permissions were declined');
            setIsConnecting(false);
          }
        },
        { scope: FACEBOOK_APP_CONFIG.scope }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
      setIsConnecting(false);
    }
  };

  return {
    isScriptLoaded,
    loginError,
    isConnecting,
    handleManualLoginClick,
    handleAdvancedPermissionsLogin,
    responseFacebook,
    handleFacebookError
  };
}
