
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useAuthCheck() {
  const { isAuthenticated, hasPermissions, showConnectionDialog, checkAuth } = useMetaConnection();

  const validateAuthentication = useCallback(() => {
    // Force a fresh check of the token directly from localStorage for consistency
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    // Use the directly checked token status if it contradicts the context state
    // This helps prevent false "not authenticated" errors when token exists
    const effectiveIsAuthenticated = directAuthCheck || isAuthenticated;
    
    console.log('Auth check result:', effectiveIsAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('Direct token check:', directAuthCheck ? 'Token exists' : 'No token');
    console.log('Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    
    // Check if user is authenticated
    if (!effectiveIsAuthenticated) {
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
    
    // Double-check that we have a token
    if (!token) {
      console.log('No access token found even though isAuthenticated is true');
      const error = 'Authentication error. Please reconnect your Meta account.';
      // Signal that connection dialog should be shown
      showConnectionDialog();
      return { isValid: false, error, showDialog: true };
    }
    
    return { isValid: true, token };
  }, [isAuthenticated, hasPermissions, showConnectionDialog]);

  return { validateAuthentication };
}
