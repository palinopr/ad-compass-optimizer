
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useAuthCheck() {
  const { isAuthenticated, hasPermissions, showConnectionDialog, checkAuth } = useMetaConnection();

  const validateAuthentication = useCallback(() => {
    console.log('Performing thorough authentication validation...');
    
    // ALWAYS check token directly from localStorage for primary authentication status
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    // Log detailed information about authentication status for debugging
    console.log('Direct token check:', directAuthCheck ? 'Valid token found' : 'No valid token');
    console.log('Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    
    // If there's a valid token but context says not authenticated, trigger an auth check
    if (directAuthCheck && !isAuthenticated) {
      console.log('Authentication state mismatch detected: token exists but context says not authenticated');
      // Don't wait for this to complete as it's just ensuring future consistency
      setTimeout(() => checkAuth(), 100);
    }
    
    // ALWAYS use the direct token check as the primary source of truth
    // This prevents authentication race conditions
    const effectiveIsAuthenticated = directAuthCheck;
    
    // Check if user is authenticated based on direct token check
    if (!effectiveIsAuthenticated) {
      console.log('Authentication validation failed: No valid token found');
      const error = 'Not authenticated with Meta. Please connect your account.';
      // Signal that connection dialog should be shown
      showConnectionDialog();
      return { isValid: false, error };
    }
    
    // Now that we know authentication is valid, check permissions
    if (!hasPermissions) {
      console.log('Authentication validation: Missing required permissions');
      const error = 'Missing required ads permissions. Please update your token permissions to include ads_read or ads_management.';
      return { isValid: false, error };
    }
    
    console.log('Authentication validation successful: Valid token with required permissions');
    return { isValid: true, token };
  }, [isAuthenticated, hasPermissions, showConnectionDialog, checkAuth]);

  return { validateAuthentication };
}
