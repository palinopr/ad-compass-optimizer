import React, { useState, useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { ExternalLink, AlertCircle, Info } from 'lucide-react';
import { FACEBOOK_APP_CONFIG, FACEBOOK_LOGIN_REQUIREMENTS } from '@/config/socialAuth';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  name?: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
  status?: string;
  error?: string;
}

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
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
      window.FB.init({
        appId: FACEBOOK_APP_CONFIG.appId,
        cookie: true,
        xfbml: true,
        version: FACEBOOK_APP_CONFIG.version
      });
      setIsScriptLoaded(true);
    };

    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const responseFacebook = (response: FacebookAuthResponse) => {
    console.log('Facebook login response:', response);
    
    if (response.accessToken) {
      console.log('Facebook login success with token:', response.accessToken.substring(0, 10) + '...');
      
      metaAuthService.storeAccessToken(response.accessToken, response.userID, 'facebook');
      
      const userData = {
        name: response.name,
        email: response.email,
        picture: response.picture?.data.url
      };
      
      onLoginSuccess(userData);
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta account has been connected successfully."
      });
      
      setLoginError(null);
    } else {
      console.error('Facebook login failed:', response);
      
      if (response.status === 'unknown') {
        setLoginError('Login was cancelled or failed');
      } else if (response.error) {
        setLoginError(response.error);
      } else {
        setLoginError('Could not connect to Meta. Please try again.');
      }
      
      toast({
        title: "Connection Failed",
        description: "Could not connect to Meta. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFacebookError = (error: any) => {
    console.error('Facebook Login Error:', error);
    
    if (error) {
      if (error.message && error.message.includes('Feature Unavailable')) {
        setLoginError(
          'Facebook Login feature is unavailable. Your Facebook App needs to complete the "Authenticate and request data from users" use case and be switched to Live mode.'
        );
      } else {
        setLoginError(error.message || 'Failed to connect with Facebook');
      }
      
      toast({
        title: "Facebook Login Error",
        description: error.message || "An error occurred with Facebook Login",
        variant: "destructive"
      });
    }
  };

  const handleManualLoginClick = () => {
    console.log("Manual Facebook login clicked");
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
          }
        },
        { scope: FACEBOOK_APP_CONFIG.scope }
      );
    } else {
      console.error("Facebook SDK not loaded");
      setLoginError("Facebook SDK not loaded. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your Facebook account to access your Business Manager and ad accounts.
      </p>
      
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md w-full">
        <div className="flex items-start space-x-2 text-xs text-blue-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>
            If you encounter a "Feature Unavailable" error, your Facebook App requires additional configuration.
            Complete the "Authenticate and request data from users" use case in your Facebook App settings.
          </span>
        </div>
      </div>
      
      {isScriptLoaded ? (
        <>
          <FacebookLogin
            appId={FACEBOOK_APP_CONFIG.appId}
            autoLoad={false}
            fields="name,email,picture"
            scope={FACEBOOK_APP_CONFIG.scope}
            callback={responseFacebook}
            onFailure={handleFacebookError}
            cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors w-full md:w-auto"
            icon="fa-facebook"
            textButton="Connect with Facebook"
            redirectUri={FACEBOOK_APP_CONFIG.redirectUri}
            version={FACEBOOK_APP_CONFIG.version}
            disableMobileRedirect={true}
          />
          
          <button 
            onClick={handleManualLoginClick}
            className="mt-3 text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Alternative Login Method
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center p-4 text-gray-500">
          Loading Facebook login...
        </div>
      )}
      
      <Separator className="my-4" />
      
      <div className="w-full space-y-3 text-xs">
        <div className="flex items-center text-gray-800">
          <Info className="h-4 w-4 mr-1.5 text-blue-600" />
          <span className="font-medium">Required Facebook App Settings:</span>
        </div>
        
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          {FACEBOOK_LOGIN_REQUIREMENTS.requiredSettings.map((setting, index) => (
            <li key={index}>{setting}</li>
          ))}
        </ul>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Link 
            to="/privacy-policy"
            className="text-blue-600 hover:underline flex items-center"
          >
            Privacy Policy
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </Link>
          
          <Link 
            to="/terms-of-service"
            className="text-blue-600 hover:underline flex items-center"
          >
            Terms of Service
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacebookLoginTab;
