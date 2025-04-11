
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import FacebookLoginError from './facebook/FacebookLoginError';
import FacebookLoginButton from './facebook/FacebookLoginButton';
import FacebookNotice from './facebook/FacebookNotice';
import FacebookPermissionsInfo from './facebook/FacebookPermissionsInfo';
import FacebookPermissionsSelector from './FacebookPermissionsSelector';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FacebookLoginTabProps {
  onLoginSuccess: (userData: any) => void;
}

const FacebookLoginTab: React.FC<FacebookLoginTabProps> = ({ onLoginSuccess }) => {
  const [showPermissionSelector, setShowPermissionSelector] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const {
    isScriptLoaded,
    loginStatus,
    loginError,
    isConnecting,
    fbLogin,
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
            <CheckCircle className="h-4 w-4 mr-2" />
            You are logged in to Facebook but haven't authorized this app yet
          </p>
        </div>
      );
    }
    
    return null;
  };

  const handlePermissionsButtonClick = () => {
    setShowPermissionSelector(true);
  };

  const handlePermissionsSelected = (permissions: string[]) => {
    setSelectedPermissions(permissions);
    setShowPermissionSelector(false);
    // Now login with the selected permissions
    if (typeof fbLogin === 'function') {
      fbLogin(true, permissions); // Pass the selected permissions to fbLogin
    }
  };

  const handleClick = (useAdvancedPermissions = true) => {
    if (useAdvancedPermissions) {
      setShowPermissionSelector(true);
    } else if (typeof fbLogin === 'function') {
      fbLogin(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-center text-sm text-gray-500">
        Connect your Facebook account to access campaign data and manage Meta ad accounts
      </p>
      
      {/* Show login status if available */}
      {renderLoginStatus()}
      
      <FacebookLoginError error={loginError} />
      
      <FacebookNotice>
        We request permissions for your Meta Business assets to help you create and manage ad campaigns. 
        All your data is handled securely according to our Privacy Policy.
      </FacebookNotice>
      
      {isScriptLoaded ? (
        <>
          {showPermissionSelector ? (
            <FacebookPermissionsSelector
              onPermissionsSelected={handlePermissionsSelected}
              onCancel={() => setShowPermissionSelector(false)}
            />
          ) : (
            <div className="w-full space-y-4">
              <FacebookLoginButton 
                onClick={handlePermissionsButtonClick}
                isConnecting={isConnecting}
                advancedPermissions={true}
                text="Connect with Campaign Permissions"
              />
              
              <div className="text-center my-2">
                <p className="text-sm text-gray-500">or</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={() => handleClick(false)}
                disabled={isConnecting}
              >
                Log in with Basic Permissions
              </Button>
              
              <FacebookPermissionsInfo />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center p-4 text-gray-500">
          Loading Facebook login...
        </div>
      )}
      
      <Separator className="my-4" />
    </div>
  );
};

export default FacebookLoginTab;
