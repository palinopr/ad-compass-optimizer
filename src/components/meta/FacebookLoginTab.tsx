
import React from 'react';
import FacebookLogin from 'react-facebook-login';
import { FACEBOOK_APP_CONFIG, IS_DEV_MODE } from '@/config/socialAuth';
import { Separator } from '@/components/ui/separator';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import FacebookLoginError from './facebook/FacebookLoginError';
import FacebookLoginButton from './facebook/FacebookLoginButton';
import FacebookNotice from './facebook/FacebookNotice';
import FacebookPermissionsInfo from './facebook/FacebookPermissionsInfo';
import FacebookRequirementsInfo from './facebook/FacebookRequirementsInfo';
import BusinessIntegrationInfo from './facebook/BusinessIntegrationInfo';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const {
    isScriptLoaded,
    loginError,
    isConnecting,
    handleManualLoginClick,
    responseFacebook,
    handleFacebookError
  } = useFacebookLogin(onLoginSuccess);

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your Facebook account to access your ad accounts and campaign data.
      </p>
      
      <FacebookLoginError error={loginError} />
      
      {IS_DEV_MODE && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle>Development Mode Active</AlertTitle>
          <AlertDescription className="text-sm text-amber-700">
            Your app is in development mode. Advanced permissions (ads_management, ads_read, business_management) 
            require Meta App Review approval before they can be used in production. Currently, only basic 
            permissions will work.
          </AlertDescription>
        </Alert>
      )}
      
      <FacebookNotice>
        We'll request basic profile information to identify your account.
        For ad management features, please use the advanced permissions option.
      </FacebookNotice>
      
      {isScriptLoaded ? (
        <div className="w-full space-y-4">
          <FacebookLoginButton 
            onClick={() => handleManualLoginClick()}
            isConnecting={isConnecting}
            advancedPermissions={false}
            text="Continue with Facebook"
          />
          
          <Separator className="my-2">
            <div className="px-2 text-xs text-gray-500">OR</div>
          </Separator>
          
          <FacebookLoginButton 
            onClick={() => handleManualLoginClick(true)}
            isConnecting={isConnecting}
            advancedPermissions={true}
            text="Connect with Advanced Ad Permissions"
          />
          
          <BusinessIntegrationInfo />
          
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
