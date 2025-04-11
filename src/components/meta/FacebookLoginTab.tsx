
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
import BusinessIntegrationInfo from './facebook/BusinessIntegrationInfo';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const {
    isScriptLoaded,
    loginStatus,
    loginError,
    isConnecting,
    handleManualLoginClick,
    responseFacebook,
    handleFacebookError
  } = useFacebookLogin(onLoginSuccess);

  // Render different status messages based on login status
  const renderLoginStatus = () => {
    if (!loginStatus || !isScriptLoaded) return null;
    
    if (loginStatus === 'connected') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-green-700 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            You are already logged in to Facebook and this app
          </p>
        </div>
      );
    } else if (loginStatus === 'not_authorized') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-amber-700 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            You are logged in to Facebook but haven't authorized this app yet
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your Facebook account to access your ad accounts and campaign data.
      </p>
      
      {/* Show login status if available */}
      {renderLoginStatus()}
      
      <FacebookLoginError error={loginError} />
      
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
