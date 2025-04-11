
import { useState } from 'react';
import { useResponseHandler } from './useResponseHandler';
import { FACEBOOK_AD_PERMISSIONS } from '@/config/socialAuth';

export function useLoginMethods(onSuccess: (userData: any) => void) {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  
  const { handleFacebookResponse } = useResponseHandler({
    onSuccess,
    onFailure: (error) => {
      setLoginError(`Login failed: ${error}`);
      setIsConnecting(false);
    },
    setIsConnecting
  });

  // Handle response from Facebook SDK
  const responseFacebook = (response: any) => {
    console.log('Facebook response:', response);
    handleFacebookResponse(response);
  };

  // Handle Facebook error
  const handleFacebookError = (error: any) => {
    console.error('Facebook login error:', error);
    setLoginError(`Login error: ${error.message || 'Unknown error'}`);
    setIsConnecting(false);
  };

  // Manual click handler for Facebook login button
  const handleManualLoginClick = (useAdvancedPermissions: boolean = false, customPermissions?: string[]) => {
    if (window.FB) {
      fbLogin(useAdvancedPermissions, customPermissions);
    } else {
      setLoginError('Facebook SDK not loaded');
    }
  };

  // Perform Facebook login with appropriate permissions
  const fbLogin = (useAdvancedPermissions: boolean = false, customPermissions?: string[]) => {
    setIsConnecting(true);
    setLoginError(null);
    
    if (!window.FB) {
      setLoginError('Facebook SDK not loaded');
      setIsConnecting(false);
      return;
    }
    
    try {
      console.log('Initiating Facebook login...');
      
      // Determine which permissions to request
      let permissions: string[];
      
      if (customPermissions && customPermissions.length > 0) {
        // Use custom permissions if provided
        permissions = customPermissions;
      } else if (useAdvancedPermissions) {
        // Fix: Use a hard-coded array of advanced permissions instead of accessing nonexistent property
        permissions = ['ads_management', 'ads_read', 'business_management', 'pages_read_engagement', 'pages_manage_ads'];
      } else {
        // Basic permissions only
        permissions = ['public_profile', 'email'];
      }
      
      console.log(`Requesting permissions: ${permissions.join(', ')}`);
      
      window.FB.login(
        (response) => {
          if (response.status === 'connected') {
            console.log('Facebook login successful', response);
            
            // Get user information
            window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo) => {
              console.log('User info response:', userInfo);
              
              if (userInfo && !userInfo.error) {
                // Get granted permissions
                window.FB.api('/me/permissions', (permResponse) => {
                  console.log('Permissions response:', permResponse);
                  
                  const grantedPermissions = permResponse.data
                    ?.filter((p: any) => p.status === 'granted')
                    .map((p: any) => p.permission) || [];
                  
                  responseFacebook({
                    ...response.authResponse,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture?.data?.url,
                    grantedPermissions
                  });
                });
              } else {
                handleFacebookError(userInfo?.error || new Error('Could not fetch user data'));
              }
            });
          } else {
            console.log('Facebook login failed or cancelled', response);
            setIsConnecting(false);
            
            if (response.status === 'not_authorized') {
              setLoginError('You did not authorize this application');
            } else {
              setLoginError('Facebook login was cancelled or failed');
            }
          }
        },
        { scope: permissions.join(','), return_scopes: true }
      );
    } catch (error) {
      console.error('Error during Facebook login:', error);
      setLoginError(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

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
