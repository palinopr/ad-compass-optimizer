
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

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Facebook SDK loaded");
      window.FB?.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_APP_CONFIG.version
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
