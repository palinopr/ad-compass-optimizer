
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

interface FacebookSDK {
  init(options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope: string; return_scopes?: boolean }
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
}

declare global {
  interface Window {
    FB?: FacebookSDK;
  }
}

export {};
