
import { useFacebookScript } from './facebook/useScript';
import { useLoginMethods } from './facebook/useLoginMethods';

export interface UseFacebookLoginResult {
  isScriptLoaded: boolean;
  loginError: string | null;
  isConnecting: boolean;
  handleManualLoginClick: () => void;
  responseFacebook: (response: any) => void;
  handleFacebookError: (error: any) => void;
}

export function useFacebookLogin(onLoginSuccess: (userData: any) => void): UseFacebookLoginResult {
  // Load the Facebook SDK script
  const { isScriptLoaded } = useFacebookScript();
  
  // Set up login methods and response handling
  const {
    loginError,
    isConnecting,
    handleManualLoginClick,
    responseFacebook,
    handleFacebookError
  } = useLoginMethods(onLoginSuccess);

  return {
    isScriptLoaded,
    loginError,
    isConnecting,
    handleManualLoginClick,
    responseFacebook,
    handleFacebookError
  };
}
