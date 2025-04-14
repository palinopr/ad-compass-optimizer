
import { useCallback } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';

export const useTokenValidation = () => {
  const validateToken = useCallback(() => {
    const token = metaAuthService.getAccessToken();
    
    if (!token || token.length < 50) {
      return {
        isValid: false,
        error: 'Not authenticated with Meta. Please connect your account.'
      };
    }

    return {
      isValid: true,
      token
    };
  }, []);

  return { validateToken };
};
