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

  // Main function to handle Facebook login
  const fbLogin = (useAdvancedPermissions = false) => {
    console.log("Facebook login clicked", useAdvancedPermissions ? "with advanced permissions" : "with basic permissions");
    setIsConnecting(true);
    
    // Always use the full scope when advanced permissions are requested
    const scope = useAdvancedPermissions ? FACEBOOK_APP_CONFIG.scope : FACEBOOK_APP_CONFIG.basicScope;
    
    if (window.FB) {
      window.FB.login(
        (response) => {
          console.log("FB.login response:", response);
          if (response.authResponse) {
            // After successful login, fetch user data
            fetchUserData(response.authResponse, useAdvancedPermissions);
          } else {
            console.log('User cancelled login or did not fully authorize.');
            setLoginError('Login was cancelled');
            setIsConnecting(false);
          }
        },
        { 
          scope, 
          return_scopes: true,
          auth_type: 'rerequest',  // Force re-authentication
          enable_profile_selector: true // Enable profile selector
        }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
      setIsConnecting(false);
    }
  };

  // Function to fetch user data after successful login
  const fetchUserData = (authResponse: FacebookAuthResponse, hasBusinessAccess: boolean) => {
    if (window.FB) {
      window.FB.api(
        '/me', 
        { fields: 'name,email,picture' },
        (userInfo) => {
          console.log("Received Facebook user info:", userInfo);
          
          if (userInfo && !userInfo.error) {
            responseFacebook({
              accessToken: authResponse.accessToken,
              userID: authResponse.userID,
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture?.data?.url,
              hasBusinessAccess: hasBusinessAccess
            });
          } else {
            setLoginError('Could not fetch user information');
            setIsConnecting(false);
          }
        }
      );
    }
  };

  // Keep the previous function name for backward compatibility
  const handleManualLoginClick = fbLogin;

  return {
    loginError,
    isConnecting,
    handleManualLoginClick,
    fbLogin,
    responseFacebook,
    handleFacebookError,
    setIsConnecting,
    setLoginError
  };
}
