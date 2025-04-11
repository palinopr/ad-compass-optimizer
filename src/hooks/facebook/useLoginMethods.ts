
import { FACEBOOK_APP_CONFIG, FACEBOOK_AD_PERMISSIONS } from '@/config/socialAuth';
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
            // Check if we got business integration permissions
            checkBusinessPermissions(response.authResponse.accessToken)
              .then(hasBusinessAccess => {
                if (hasBusinessAccess) {
                  responseFacebook({
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID,
                    hasBusinessAccess: true
                  });
                } else {
                  console.log("Business permissions not granted");
                  responseFacebook({
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID,
                    hasBusinessAccess: false
                  });
                }
              })
              .catch(error => {
                console.error("Error checking business permissions:", error);
                responseFacebook({
                  accessToken: response.authResponse.accessToken,
                  userID: response.authResponse.userID
                });
              });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled or advanced permissions were declined');
            setIsConnecting(false);
          }
        },
        { 
          scope: `${FACEBOOK_APP_CONFIG.scope},${FACEBOOK_AD_PERMISSIONS.advanced}`,
          return_scopes: true  // This will return the granted scopes in the response
        }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
      setIsConnecting(false);
    }
  };

  // Helper function to check if business permissions were granted
  const checkBusinessPermissions = async (token: string): Promise<boolean> => {
    try {
      // Attempt to make a request that requires business permissions
      const response = await fetch(
        `https://graph.facebook.com/${FACEBOOK_APP_CONFIG.version}/me/businesses?access_token=${token}`
      );
      
      const result = await response.json();
      
      // If we don't get an error, we have business permissions
      return !result.error;
    } catch (error) {
      console.error("Error checking business permissions:", error);
      return false;
    }
  };

  return {
    loginError,
    isConnecting,
    handleManualLoginClick,
    handleAdvancedPermissionsLogin,
    responseFacebook,
    handleFacebookError,
    setIsConnecting,
    setLoginError
  };
}
