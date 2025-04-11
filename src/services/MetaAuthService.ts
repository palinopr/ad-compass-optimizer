export class MetaAuthService {
  // We'll keep the token storage and redirect URI for compatibility
  private redirectUri: string = window.location.origin + '/campaigns';

  // Initiate the login process - this will now be handled by the Facebook SDK
  public initiateLogin(): void {
    // This is handled by the FacebookLogin component
    return;
  }

  // Store the access token from Facebook login
  public storeAccessToken(accessToken: string, userId: string = 'facebook_user'): void {
    localStorage.setItem('meta_access_token', accessToken);
    localStorage.setItem('meta_user_id', userId);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('meta_access_token');
  }

  // Get the stored access token
  public getAccessToken(): string | null {
    return localStorage.getItem('meta_access_token');
  }

  // Logout user
  public logout(): void {
    localStorage.removeItem('meta_access_token');
    localStorage.removeItem('meta_user_id');
  }
}

export const metaAuthService = new MetaAuthService();
