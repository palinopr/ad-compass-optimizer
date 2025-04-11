
import { metaAuthService } from '@/services/MetaAuthService';

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
      
      // Store the access token and user info
      metaAuthService.storeAccessToken(token, userId, 'facebook', grantedPermissions);
      
      // Call the success callback
      onSuccess({
        name,
        email,
        picture,
        userId,
        tokenSource: 'facebook',
        tokenPermissions: grantedPermissions
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
