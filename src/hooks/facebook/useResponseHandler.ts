
import { metaAuthService } from '@/services/MetaAuthService';
import { META_API_CONFIG } from '@/config/socialAuth';

interface UseResponseHandlerProps {
  onSuccess: (userData: any) => void;
  onFailure: (error: string) => void;
  setIsConnecting: (isConnecting: boolean) => void;
}

export function useResponseHandler({
  onSuccess,
  onFailure,
  setIsConnecting
}: UseResponseHandlerProps) {
  const handleFacebookResponse = (response: any) => {
    try {
      if (!response || !response.accessToken) {
        onFailure('Invalid response from Facebook');
        return;
      }

      const token = response.accessToken;
      const userId = response.userID || 'facebook_user';
      const name = response.name;
      const email = response.email;
      const picture = response.picture;
      const grantedPermissions = response.grantedPermissions || [];
      
      // Log the permissions we received
      console.log('Permissions granted by Facebook:', grantedPermissions);
      
      // Store the token with the granted permissions
      metaAuthService.storeAccessToken(token, userId, 'facebook', grantedPermissions);
      
      // Check if we have the required permissions for ad management
      const hasAdPermissions = META_API_CONFIG.adPermissions.every(
        perm => grantedPermissions.includes(perm)
      );
      
      // If we don't have ad permissions, warn but still proceed
      if (!hasAdPermissions) {
        console.warn('Connected successfully but missing ad permissions. Some features may not work.');
      }
      
      // Call the success callback
      onSuccess({
        name,
        email,
        picture,
        userId,
        tokenSource: 'facebook',
        tokenPermissions: grantedPermissions,
        hasAdPermissions
      });
    } catch (error) {
      console.error('Error handling Facebook response:', error);
      onFailure(error instanceof Error ? error.message : 'Failed to process login');
    } finally {
      setIsConnecting(false);
    }
  };

  return { handleFacebookResponse };
}
