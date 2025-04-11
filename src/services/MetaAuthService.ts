
export class MetaAuthService {
  // Replace these with your actual Meta App credentials
  private appId: string = '';
  private redirectUri: string = window.location.origin + '/campaigns';
  private scopes: string[] = [
    'ads_management',
    'ads_read', 
    'business_management',
    'public_profile',
    'email'
  ];

  // Initiate the login process
  public initiateLogin(): void {
    if (!this.appId) {
      // No App ID provided, show an error through alert dialog
      throw new Error('Meta App ID is not configured. Please set your Meta App ID in the MetaAuthService.ts file');
    }

    const scopeString = this.scopes.join(',');
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopeString}&response_type=code&state=${this.generateState()}`;
    
    window.location.href = authUrl;
  }

  // Generate a random state parameter for security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Handle the redirect from Meta
  public async handleRedirect(code: string): Promise<{accessToken: string, userId: string}> {
    // In a real implementation, this would be a server-side call
    // to exchange the code for an access token
    
    // For demo purposes, we'll simulate the response
    const response = await this.exchangeCodeForToken(code);
    
    // Store the token securely
    localStorage.setItem('meta_access_token', response.accessToken);
    localStorage.setItem('meta_user_id', response.userId);
    
    return response;
  }

  // Exchange authorization code for access token (server-side)
  private async exchangeCodeForToken(code: string): Promise<{accessToken: string, userId: string}> {
    // This should be implemented on your backend for security
    // The frontend should not directly exchange the code for a token
    
    // Simulated response for demo purposes
    return {
      accessToken: 'SIMULATED_ACCESS_TOKEN',
      userId: 'SIMULATED_USER_ID'
    };
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
