
interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: string;
  signedRequest: string;
  userID: string;
}

interface FacebookLoginStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null;
  status: string;
}

interface FacebookAppEvents {
  logPageView: () => void;
}

interface FacebookLoginOptions {
  scope: string;
  return_scopes?: boolean;
  auth_type?: 'rerequest' | 'reauthenticate' | 'reauthorize';
  enable_profile_selector?: boolean;
}

interface FacebookInitParams {
  appId: string;
  cookie?: boolean;
  xfbml?: boolean;
  version: string;
  status?: boolean;
}

interface FacebookSDK {
  init(options: FacebookInitParams): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options?: FacebookLoginOptions
  ): void;
  getLoginStatus(
    callback: (response: FacebookLoginStatusResponse) => void,
    force?: boolean
  ): void;
  api(
    path: string,
    method: string,
    params: object,
    callback: (response: any) => void
  ): void;
  AppEvents?: FacebookAppEvents;
}

declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
  }
}

export {};
