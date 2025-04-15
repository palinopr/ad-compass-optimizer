
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateToken = (token: string): ValidationResult => {
  if (!token) {
    return {
      isValid: false,
      error: 'Missing access token'
    };
  }

  if (token.length < 50) {
    return {
      isValid: false,
      error: 'Invalid token format'
    };
  }

  return { isValid: true };
};
