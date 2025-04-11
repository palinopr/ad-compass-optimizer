
export class MetaAuthService {
  // Keys for localStorage
  private static readonly TOKEN_KEY = 'meta_access_token';
  private static readonly USER_ID_KEY = 'meta_user_id';
  private static readonly TOKEN_SOURCE_KEY = 'meta_token_source';

  // Store the access token from login
  public storeAccessToken(accessToken: string, userId: string = 'facebook_user', source: string = 'facebook'): void {
    localStorage.setItem(MetaAuthService.TOKEN_KEY, accessToken);
    localStorage.setItem(MetaAuthService.USER_ID_KEY, userId);
    localStorage.setItem(MetaAuthService.TOKEN_SOURCE_KEY, source);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!localStorage.getItem(MetaAuthService.TOKEN_KEY);
  }

  // Get the stored access token
  public getAccessToken(): string | null {
    return localStorage.getItem(MetaAuthService.TOKEN_KEY);
  }

  // Get the token source (facebook or manual)
  public getTokenSource(): string {
    return localStorage.getItem(MetaAuthService.TOKEN_SOURCE_KEY) || 'unknown';
  }

  // Get the user ID
  public getUserId(): string | null {
    return localStorage.getItem(MetaAuthService.USER_ID_KEY);
  }

  // Logout user
  public logout(): void {
    localStorage.removeItem(MetaAuthService.TOKEN_KEY);
    localStorage.removeItem(MetaAuthService.USER_ID_KEY);
    localStorage.removeItem(MetaAuthService.TOKEN_SOURCE_KEY);
  }
}

export const metaAuthService = new MetaAuthService();
