
/**
 * Utility functions for handling Meta API tokens
 */

/**
 * Cleans a token by removing whitespace, quotes, and potential URL fragments
 */
export const cleanToken = (token: string): string => {
  if (!token) return '';
  
  // Remove all whitespace, line breaks, quotes
  let cleaned = token.replace(/\s+/g, '');
  
  // Remove quotes that might have been accidentally included
  cleaned = cleaned.replace(/["']/g, '');
  
  // Remove any URL fragments that might have been copied
  if (cleaned.includes('&')) {
    cleaned = cleaned.split('&')[0];
  }
  
  return cleaned;
};

/**
 * Validates a token format and returns validation status with reason if invalid
 */
export const validateTokenFormat = (token: string): { valid: boolean, reason?: string } => {
  const cleaned = cleanToken(token);
  
  if (!cleaned) {
    return { valid: false, reason: "Token is empty" };
  }
  
  // Meta tokens are typically very long
  if (cleaned.length < 50) {
    return { valid: false, reason: "Token is too short. Meta tokens are typically much longer." };
  }
  
  // Check for invalid characters
  const invalidCharsRegex = /[^a-zA-Z0-9_\-\.]/;
  if (invalidCharsRegex.test(cleaned)) {
    return { valid: false, reason: "Token contains invalid characters" };
  }
  
  return { valid: true };
};
