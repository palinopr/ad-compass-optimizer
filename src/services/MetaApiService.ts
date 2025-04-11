
export class MetaApiService {
  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      return {
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/adaccounts?fields=name,account_id,account_status,currency&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw error;
    }
  }
}
