
import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { ExternalLink } from 'lucide-react';

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
      metaAuthService.storeAccessToken(response.accessToken, response.userID);
      
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
      <p className="mb-6 text-center text-sm text-gray-500">
        Connect your personal Facebook account for development. 
        Note that during development we're using limited permissions.
      </p>
      <FacebookLogin
        appId="1356517842213704"
        autoLoad={false}
        fields="name,email,picture"
        scope="public_profile,email"
        callback={responseFacebook}
        cssClass="bg-[#1877F2] text-white py-2 px-4 rounded flex items-center justify-center"
        icon="fa-facebook"
        textButton="Connect with Facebook"
      />
    </div>
  );
};

export default FacebookLoginTab;
