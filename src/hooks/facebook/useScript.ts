
import { useState, useEffect } from 'react';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';

export function useFacebookScript() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'connected' | 'not_authorized' | 'unknown' | null>(null);

  useEffect(() => {
    console.log("Initializing Facebook SDK");
    
    // If the SDK is already loaded, don't reload it
    if (window.FB) {
      console.log("Facebook SDK already loaded");
      setIsScriptLoaded(true);
      checkLoginStatus();
      return;
    }

    // Using Facebook's recommended method to load the SDK
    window.fbAsyncInit = function() {
      console.log("FB Async Init called, initializing with version:", FACEBOOK_APP_CONFIG.version);
      window.FB?.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_APP_CONFIG.version,
        status: true // Enable checking login status
      });
      
      // Log page view as recommended
      window.FB?.AppEvents?.logPageView();
      
      // Check login status immediately after SDK is loaded
      checkLoginStatus();
      
      // Signal that the script is loaded
      setIsScriptLoaded(true);
    };

    // Create and append the script element using Facebook's recommended approach
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // No cleanup needed as we want the SDK to persist across the app
  }, []);

  // Function to check login status
  const checkLoginStatus = () => {
    if (!window.FB) return;
    
    console.log("Checking Facebook login status");
    window.FB.getLoginStatus((response) => {
      console.log("Facebook login status response:", response);
      
      setLoginStatus(response.status as 'connected' | 'not_authorized' | 'unknown');
      
      // If user is already connected, we can store the auth data
      if (response.status === 'connected' && response.authResponse) {
        // You could handle automatic login here if needed
        console.log("User is already connected with Facebook", response.authResponse);
      }
    }, true); // Force status check
  };

  return { isScriptLoaded, loginStatus, checkLoginStatus };
}
