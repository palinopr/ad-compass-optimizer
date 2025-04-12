
export class MetaAuthService {
  // Keys for localStorage
  private static readonly TOKEN_KEY = 'meta_access_token';
  private static readonly USER_ID_KEY = 'meta_user_id';
  private static readonly TOKEN_SOURCE_KEY = 'meta_token_source';
  private static readonly PERMISSIONS_KEY = 'meta_permissions';
  private static readonly TOKEN_TIMESTAMP_KEY = 'meta_token_timestamp';

  // Store the access token from login
  public storeAccessToken(accessToken: string, userId: string = 'facebook_user', source: string = 'facebook', permissions: string[] = []): void {
    // Clean the token before storing (remove any whitespace)
    const cleanedToken = accessToken.trim();
    
    // Basic validation before storing
    if (!cleanedToken || cleanedToken.length < 50) {
      console.error('Invalid token format detected in storeAccessToken');
      return;
    }
    
    // Ensure we have ads_read and ads_management permissions
    if (!permissions.includes('ads_read')) {
      permissions.push('ads_read');
    }
    
    if (!permissions.includes('ads_management')) {
      permissions.push('ads_management');
    }
    
    localStorage.setItem(MetaAuthService.TOKEN_KEY, cleanedToken);
    localStorage.setItem(MetaAuthService.USER_ID_KEY, userId);
    localStorage.setItem(MetaAuthService.TOKEN_SOURCE_KEY, source);
    localStorage.setItem(MetaAuthService.PERMISSIONS_KEY, JSON.stringify(permissions));
    
    // Store timestamp for token freshness checks
    localStorage.setItem(MetaAuthService.TOKEN_TIMESTAMP_KEY, Date.now().toString());
    
    console.log('Token stored successfully with length:', cleanedToken.length);
    console.log('Permissions stored:', permissions);
  }

  // Check token freshness
  public checkTokenFreshness(): { isFresh: boolean, age: number } {
    const timestamp = localStorage.getItem(MetaAuthService.TOKEN_TIMESTAMP_KEY);
    if (!timestamp) {
      return { isFresh: false, age: 0 };
    }
    
    const tokenAge = Date.now() - parseInt(timestamp);
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    
    return { 
      isFresh: tokenAge < sixtyDaysInMs, 
      age: Math.floor(tokenAge / (24 * 60 * 60 * 1000)) // Age in days
    };
  }

  // Check if user is authenticated with a valid token
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    
    // Basic validation to ensure token exists and has reasonable length
    if (!token || token.length < 50) {
      console.log('Token validation failed: missing token or too short');
      return false;
    }
    
    // Check timestamp to detect potentially stale tokens (older than 60 days)
    const tokenFreshness = this.checkTokenFreshness();
    if (!tokenFreshness.isFresh) {
      console.log(`Token may be stale (${tokenFreshness.age} days old)`);
      // We don't auto-invalidate as some long-lived tokens are valid for longer
      // Just log a warning
    }
    
    // Check if we have the minimal required permissions
    const permissions = this.getPermissions();
    const hasAdPermission = permissions.some(p => 
      p === 'ads_management' || p === 'ads_read'
    );
    
    if (!hasAdPermission) {
      console.log('Token lacks ads permissions, campaigns will not work');
      // Don't return false here, let the component handle permissions separately
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
    
    if (token.length < 50) {
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
    // Ensure we always have the required permissions
    if (!permissions.includes('ads_read')) {
      permissions.push('ads_read');
    }
    
    if (!permissions.includes('ads_management')) {
      permissions.push('ads_management');
    }
    
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
