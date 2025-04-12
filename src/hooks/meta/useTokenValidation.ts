
import { useState } from 'react';
import { validateTokenFormat, cleanToken } from '@/utils/tokenUtils';

export function useTokenValidation() {
  const [manualToken, setManualToken] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const validateToken = (token: string) => {
    const cleanedToken = cleanToken(token);
    const validation = validateTokenFormat(cleanedToken);
    
    if (!validation.valid) {
      const errorMsg = validation.reason || "Please enter a valid access token";
      setErrorMessage(errorMsg);
      return { 
        isValid: false, 
        cleanedToken, 
        errorMsg 
      };
    }
    
    return { 
      isValid: true, 
      cleanedToken,
      errorMsg: null
    };
  };
  
  return {
    manualToken,
    setManualToken,
    errorMessage,
    setErrorMessage,
    validateToken
  };
}
