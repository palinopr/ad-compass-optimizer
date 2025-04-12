
export class MetaAuthService {
  // Keys for localStorage
  private static readonly TOKEN_KEY = 'meta_access_token';
  private static readonly USER_ID_KEY = 'meta_user_id';
  private static readonly TOKEN_SOURCE_KEY = 'meta_token_source';
  private static readonly PERMISSIONS_KEY = 'meta_permissions';
  private static readonly TOKEN_TIMESTAMP_KEY = 'meta_token_timestamp';

  // Store the access token from login
  public storeAccessToken(accessToken: string, userId: string = 'facebook_user', source: string = 'facebook', permissions: string[] = []): void {
    // Basic validation before storing
    if (!accessToken || accessToken.trim().length < 20) {
      console.error('Invalid token format detected in storeAccessToken');
      return;
    }
    
    localStorage.setItem(MetaAuthService.TOKEN_KEY, accessToken);
    localStorage.setItem(MetaAuthService.USER_ID_KEY, userId);
    localStorage.setItem(MetaAuthService.TOKEN_SOURCE_KEY, source);
    localStorage.setItem(MetaAuthService.PERMISSIONS_KEY, JSON.stringify(permissions));
    
    // Store timestamp for token freshness checks
    localStorage.setItem(MetaAuthService.TOKEN_TIMESTAMP_KEY, Date.now().toString());
    
    console.log('Token stored successfully with length:', accessToken.length);
  }

  // Check if user is authenticated with a valid token
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    
    // Basic validation to ensure token exists and has reasonable length
    if (!token || token.length < 20) {
      console.log('Token validation failed: missing token or too short');
      return false;
    }
    
    // Check timestamp to detect potentially stale tokens (older than 60 days)
    const timestamp = localStorage.getItem(MetaAuthService.TOKEN_TIMESTAMP_KEY);
    if (timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp);
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
      
      if (tokenAge > sixtyDaysInMs) {
        console.log('Token may be stale (older than 60 days)');
        // We don't auto-invalidate as some long-lived tokens are valid for longer
        // Just log a warning
      }
    }
    
    return true;
  }

  // Get the stored access token
  public getAccessToken(): string | null {
    const token = localStorage.getItem(MetaAuthService.TOKEN_KEY);
    
    if (!token) {
      console.log('No token found in storage');
      return null;
    }
    
    if (token.length < 20) {
      console.log('Token found but appears invalid (too short)');
      return null;
    }
    
    return token;
  }

  // Get the token source (facebook or manual)
  public getTokenSource(): string {
    return localStorage.getItem(MetaAuthService.TOKEN_SOURCE_KEY) || 'unknown';
  }

  // Get the user ID
  public getUserId(): string | null {
    return localStorage.getItem(MetaAuthService.USER_ID_KEY);
  }

  // Get the permissions granted with this token
  public getPermissions(): string[] {
    const permissions = localStorage.getItem(MetaAuthService.PERMISSIONS_KEY);
    return permissions ? JSON.parse(permissions) : [];
  }

  // Update permissions for the current token
  public updatePermissions(permissions: string[]): void {
    localStorage.setItem(MetaAuthService.PERMISSIONS_KEY, JSON.stringify(permissions));
  }

  // Check if a specific permission is granted
  public hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  // Logout user and clear all Meta-related data
  public logout(): void {
    console.log('Clearing Meta authentication data');
    localStorage.removeItem(MetaAuthService.TOKEN_KEY);
    localStorage.removeItem(MetaAuthService.USER_ID_KEY);
    localStorage.removeItem(MetaAuthService.TOKEN_SOURCE_KEY);
    localStorage.removeItem(MetaAuthService.PERMISSIONS_KEY);
    localStorage.removeItem(MetaAuthService.TOKEN_TIMESTAMP_KEY);
    
    // Also clear ad account selections to prevent issues after reconnection
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    
    console.log('Meta authentication data cleared');
  }
}

export const metaAuthService = new MetaAuthService();
