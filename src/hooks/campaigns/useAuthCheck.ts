
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useAuthCheck() {
  const { isAuthenticated, hasPermissions, showConnectionDialog, checkAuth } = useMetaConnection();

  const validateAuthentication = useCallback(() => {
    // Force a check of authentication status
    checkAuth();
    console.log('Auth check result:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('User is not authenticated');
      const error = 'Not authenticated with Meta. Please connect your account.';
      // Signal that connection dialog should be shown
      showConnectionDialog();
      return { isValid: false, error };
    }
    
    // Check if user has the necessary permissions
    if (!hasPermissions) {
      console.log('User lacks required permissions');
      const error = 'Missing required ads permissions. Please update your token permissions to include ads_read or ads_management.';
      return { isValid: false, error };
    }
    
    // Get authentication token
    const token = metaAuthService.getAccessToken();
    if (!token) {
      console.log('No access token found even though isAuthenticated is true');
      const error = 'Authentication error. Please reconnect your Meta account.';
      // Signal that connection dialog should be shown
      showConnectionDialog();
      return { isValid: false, error, showDialog: true };
    }
    
    return { isValid: true, token };
  }, [isAuthenticated, hasPermissions, showConnectionDialog, checkAuth]);

  return { validateAuthentication };
}
