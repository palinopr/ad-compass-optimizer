
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { validateAdAccountPermissions } from '@/services/api/meta-accounts/permissionChecker';

export const useTokenValidation = () => {
  const validateToken = useCallback(() => {
    const token = metaAuthService.getAccessToken();
    
    if (!token || token.length < 50) {
      return {
        isValid: false,
        error: 'Not authenticated with Meta. Please connect your account.'
      };
    }
    
    // Check for permissions - handle gracefully
    try {
      validateAdAccountPermissions();
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Missing required Meta API permissions'
      };
    }
    
    // Check ad account selection
    const selectedAdAccount = localStorage.getItem('selected_ad_account');
    if (!selectedAdAccount) {
      return {
        isValid: false,
        error: 'No ad account selected. Please select an ad account to continue.'
      };
    }

    return {
      isValid: true,
      token
    };
  }, []);

  return { validateToken };
};
