
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';
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
    
    // Always use the full scope when advanced permissions are requested
    const scope = useAdvancedPermissions ? FACEBOOK_APP_CONFIG.scope : FACEBOOK_APP_CONFIG.basicScope;
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("FB.login response:", response);
          if (response.authResponse) {
            responseFacebook({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              hasBusinessAccess: useAdvancedPermissions // Always reflect the requested permissions
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled');
            setIsConnecting(false);
          }
        },
        { 
          scope, 
          return_scopes: true,
          auth_type: 'rerequest',  // Add this to force re-authentication
          enable_profile_selector: true // Enable profile selector where applicable
        }
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
