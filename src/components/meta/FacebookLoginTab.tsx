
import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';

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
}

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const { toast } = useToast();

  const responseFacebook = (response: FacebookAuthResponse) => {
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
    } else {
      console.error('Facebook login failed:', response);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Meta. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-4 text-center text-sm text-gray-500">
        Connect your personal Facebook account to manage your Meta ad campaigns.
      </p>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md w-full">
        <div className="flex items-start space-x-2 text-xs text-blue-700">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>
            This integration uses an App ID for development purposes. For production use, 
            you should create your own Facebook App in the Meta for Developers portal.
          </span>
        </div>
      </div>
      
      <FacebookLogin
        appId={FACEBOOK_APP_CONFIG.appId}
        autoLoad={false}
        fields="name,email,picture"
        scope={FACEBOOK_APP_CONFIG.scope}
        callback={responseFacebook}
        cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center"
        icon="fa-facebook"
        textButton="Connect with Facebook"
      />
      
      <div className="text-center mt-4">
        <a 
          href="https://developers.facebook.com/docs/facebook-login/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center justify-center"
        >
          Learn about Facebook Login
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default FacebookLoginTab;
