
import { useState, useEffect } from 'react';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';

export function useFacebookScript() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    console.log("Initializing Facebook SDK");
    
    // If the SDK is already loaded, don't reload it
    if (window.FB) {
      console.log("Facebook SDK already loaded");
      setIsScriptLoaded(true);
      return;
    }

    // Using Facebook's recommended method to load the SDK
    window.fbAsyncInit = function() {
      console.log("FB Async Init called, initializing with version:", FACEBOOK_APP_CONFIG.version);
      window.FB?.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_APP_CONFIG.version
      });
      
      // Log page view as recommended
      window.FB?.AppEvents?.logPageView();
      
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

  return { isScriptLoaded };
}
