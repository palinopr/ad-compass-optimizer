
import { FACEBOOK_APP_CONFIG, IS_DEV_MODE } from '@/config/socialAuth';
import { useResponseHandler, FacebookAuthResponse } from './useResponseHandler';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useLoginMethods(onLoginSuccess: (userData: any) => void) {
  const { 
    loginError, 
    isConnecting, 
    setIsConnecting, 
    responseFacebook, 
    handleFacebookError,
    setLoginError 
  } = useResponseHandler(onLoginSuccess);
  
  const { toast } = useToast();

  const handleManualLoginClick = (useAdvancedPermissions = false) => {
    console.log("Facebook login clicked", useAdvancedPermissions ? "with advanced permissions" : "with basic permissions");
    setIsConnecting(true);
    
    // Choose scope based on whether advanced permissions are requested
    let scope = useAdvancedPermissions ? FACEBOOK_APP_CONFIG.scope : FACEBOOK_APP_CONFIG.basicScope;
    
    // If in development mode and trying to use advanced permissions, warn the user
    if (useAdvancedPermissions && IS_DEV_MODE) {
      console.log("Development mode detected, falling back to basic permissions");
      toast({
        title: "Development Mode",
        description: "Advanced permissions require App Review. Using basic permissions only.",
        variant: "default"
      });
    }
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("FB.login response:", response);
          if (response.authResponse) {
            responseFacebook({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              hasBusinessAccess: useAdvancedPermissions && !IS_DEV_MODE // Only true if advanced permissions were requested AND we're not in dev mode
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled');
            setIsConnecting(false);
          }
        },
        { scope }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
      setIsConnecting(false);
    }
  };

  return {
    loginError,
    isConnecting,
    handleManualLoginClick,
    responseFacebook,
    handleFacebookError,
    setIsConnecting,
    setLoginError
  };
}
