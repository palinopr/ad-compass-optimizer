
import { useFacebookScript } from './facebook/useScript';
import { useLoginMethods } from './facebook/useLoginMethods';
import { useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

export interface UseFacebookLoginResult {
  isScriptLoaded: boolean;
  loginStatus: 'connected' | 'not_authorized' | 'unknown' | null;
  loginError: string | null;
  isConnecting: boolean;
  handleManualLoginClick: (useAdvancedPermissions?: boolean, customPermissions?: string[]) => void;
  fbLogin: (useAdvancedPermissions?: boolean, customPermissions?: string[]) => void;
  responseFacebook: (response: any) => void;
  handleFacebookError: (error: any) => void;
  checkLoginStatus: () => void;
}

export function useFacebookLogin(onLoginSuccess: (userData: any) => void): UseFacebookLoginResult {
  // Load the Facebook SDK script and get login status
  const { isScriptLoaded, loginStatus, checkLoginStatus } = useFacebookScript();
  
  // Set up login methods and response handling
  const {
    loginError,
    isConnecting,
    handleManualLoginClick,
    fbLogin,
    responseFacebook,
    handleFacebookError,
    setIsConnecting,
    setLoginError
  } = useLoginMethods(onLoginSuccess);

  // Handle automatic login if user is already connected with Facebook
  useEffect(() => {
    if (loginStatus === 'connected' && window.FB) {
      console.log("User is already connected to Facebook, fetching user info");
      
      // Only attempt auto-login if we aren't already handling a login
      if (!isConnecting && !metaAuthService.isAuthenticated()) {
        setIsConnecting(true);
        
        // Get user data from Facebook
        window.FB.api(
          '/me',
          'GET', 
          { fields: 'name,email,picture' }, 
          (userInfo) => {
            console.log("Received Facebook user info:", userInfo);
            
            if (userInfo && !userInfo.error) {
              // Get the auth response which contains the access token
              window.FB.getLoginStatus((response) => {
                if (response.status === 'connected' && response.authResponse) {
                  responseFacebook({
                    accessToken: response.authResponse.accessToken,
                    userID: response.authResponse.userID,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture?.data?.url
                  });
                } else {
                  setIsConnecting(false);
                  setLoginError('Could not retrieve authentication information');
                }
              });
            } else {
              setIsConnecting(false);
              setLoginError('Could not fetch user information');
            }
          }
        );
      }
    }
  }, [loginStatus, isScriptLoaded]);

  return {
    isScriptLoaded,
    loginStatus,
    loginError,
    isConnecting,
    handleManualLoginClick,
    fbLogin,
    responseFacebook,
    handleFacebookError,
    checkLoginStatus
  };
}
