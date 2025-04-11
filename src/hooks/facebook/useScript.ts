
import { useState, useEffect } from 'react';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';

export function useFacebookScript() {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    console.log("Initializing Facebook SDK");
    if (window.FB) {
      console.log("Facebook SDK already loaded");
      setIsScriptLoaded(true);
      return;
    }

    // Fix the version to a specific version number instead of using a variable
    // This is to avoid the "invalid version specified" error
    const apiVersion = 'v17.0'; // Hardcoded version that is known to work
    
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Facebook SDK loaded, initializing with version:", apiVersion);
      window.FB?.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: apiVersion
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

  return { isScriptLoaded };
}
