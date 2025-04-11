
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';
import { useResponseHandler, FacebookAuthResponse } from './useResponseHandler';
import { useState } from 'react';

export function useLoginMethods(onLoginSuccess: (userData: any) => void) {
  const { 
    loginError, 
    isConnecting, 
    setIsConnecting, 
    responseFacebook, 
    handleFacebookError,
    setLoginError 
  } = useResponseHandler(onLoginSuccess);

  const handleManualLoginClick = (useAdvancedPermissions = false) => {
    console.log("Facebook login clicked", useAdvancedPermissions ? "with advanced permissions" : "with basic permissions");
    setIsConnecting(true);
    
    // Choose scope based on whether advanced permissions are requested
    const scope = useAdvancedPermissions ? FACEBOOK_APP_CONFIG.scope : FACEBOOK_APP_CONFIG.basicScope;
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("FB.login response:", response);
          if (response.authResponse) {
            responseFacebook({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              hasBusinessAccess: useAdvancedPermissions
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
