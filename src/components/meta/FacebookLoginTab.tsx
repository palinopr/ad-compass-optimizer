
import React, { useState } from 'react';
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

  const responseFacebook = (response: FacebookAuthResponse) => {
    console.log('Facebook login response:', response);
    
    if (response.accessToken) {
      console.log('Facebook login success:', response);
      
      // Save token to our auth service
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
      
      // Clear any previous errors
      setLoginError(null);
    } else {
      console.error('Facebook login failed:', response);
      
      // Set login error message
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

  // Function to handle the "Feature Unavailable" error
  const handleFacebookError = (error: any) => {
    console.error('Facebook Login Error:', error);
    
    if (error) {
      // Set more specific error message
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

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your personal Facebook account to manage your Meta ad campaigns.
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
      
      <FacebookLogin
        appId={FACEBOOK_APP_CONFIG.appId}
        autoLoad={false}
        fields="name,email,picture"
        scope={FACEBOOK_APP_CONFIG.scope}
        callback={responseFacebook}
        onFailure={handleFacebookError}
        cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center"
        icon="fa-facebook"
        textButton="Connect with Facebook"
        redirectUri={FACEBOOK_APP_CONFIG.redirectUri}
        version={FACEBOOK_APP_CONFIG.version}
        disableMobileRedirect={true}
      />
      
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
      
      <div className="text-center mt-4">
        <a 
          href="https://developers.facebook.com/docs/facebook-login/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center justify-center"
        >
          Facebook Login Documentation
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default FacebookLoginTab;
