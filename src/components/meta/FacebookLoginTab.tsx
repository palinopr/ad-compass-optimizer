
import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { FACEBOOK_APP_CONFIG } from '@/config/socialAuth';
import { Separator } from '@/components/ui/separator';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import FacebookLoginError from './facebook/FacebookLoginError';
import FacebookLoginButton from './facebook/FacebookLoginButton';
import FacebookNotice from './facebook/FacebookNotice';
import FacebookPermissionsInfo from './facebook/FacebookPermissionsInfo';
import FacebookRequirementsInfo from './facebook/FacebookRequirementsInfo';
import { Button } from '@/components/ui/button';

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const {
    isScriptLoaded,
    loginError,
    isConnecting,
    handleManualLoginClick,
    handleAdvancedPermissionsLogin,
    responseFacebook,
    handleFacebookError
  } = useFacebookLogin(onLoginSuccess);

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your Facebook account to access your ad accounts and campaign data.
      </p>
      
      <FacebookLoginError error={loginError} />
      
      <FacebookNotice>
        Important: For full ad management access, your Facebook App requires 
        Meta's approval for additional permissions. During development, we're using basic 
        permissions only.
      </FacebookNotice>
      
      {isScriptLoaded ? (
        <div className="w-full space-y-4">
          <FacebookLoginButton 
            onClick={handleManualLoginClick}
            isConnecting={isConnecting}
          />
          
          <Button
            variant="outline"
            onClick={handleAdvancedPermissionsLogin}
            disabled={isConnecting}
            className="w-full"
          >
            Connect with Advanced Ad Permissions
          </Button>

          <Separator className="my-2" />
          
          <FacebookPermissionsInfo />
          
          <div className="hidden">
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
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 text-gray-500">
          Loading Facebook login...
        </div>
      )}
      
      <Separator className="my-4" />
      
      <FacebookRequirementsInfo />
    </div>
  );
};

export default FacebookLoginTab;
