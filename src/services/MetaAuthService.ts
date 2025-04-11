
export class MetaAuthService {
  // Instead of requiring an App ID, we'll use a direct token approach
  private redirectUri: string = window.location.origin + '/campaigns';

  // Initiate the login process
  public initiateLogin(): void {
    // Display instructions for how to get a token instead of redirecting
    // This will be handled by the MetaConnect component
    return;
  }

  // Store the manually entered access token
  public storeAccessToken(accessToken: string, userId: string = 'manual_user'): void {
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
