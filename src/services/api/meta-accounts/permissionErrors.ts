
interface MetaErrorObject {
  code?: number;
  error_subcode?: number;
  message?: string;
}

// Check if error is related to permissions
export const isPermissionError = (error: MetaErrorObject): boolean => {
  // Permission errors typically have these codes
  if (error.code === 190 || error.code === 200 || error.code === 104 || error.code === 10) {
    return true;
  }
  
  // Check for common permission error subcodes
  if (error.error_subcode === 460 || error.error_subcode === 463 || error.error_subcode === 464) {
    return true;
  }
  
  // Check for permission keywords in error message
  if (error.message && 
    (error.message.toLowerCase().includes('permission') || 
     error.message.toLowerCase().includes('access') ||
     error.message.toLowerCase().includes('scope') ||
     error.message.toLowerCase().includes('privilege') ||
     error.message.toLowerCase().includes('authorize'))) {
    return true;  
  }
  
  return false;
};

// Get a more user-friendly error message
export const getPermissionErrorMessage = (error: MetaErrorObject): string => {
  // Default message
  let message = 'You don\'t have permission to access this Meta Ad Account';
  
  // Token expired
  if (error.code === 190) {
    return 'Your Meta authentication has expired. Please reconnect your account.';
  }
  
  // Permission issue
  if (error.code === 200 || error.code === 10) {
    if (error.message) {
      // Clean up and simplify the message
      let cleanMessage = error.message
        .replace(/\(#\d+\)/g, '')  // Remove error codes like (#200)
        .replace(/\([^)]*\)/g, '') // Remove other parentheses content
        .trim();
      
      return cleanMessage;
    }
  }
  
  // Rate limiting
  if (error.code === 80004) {
    return 'Rate limit reached. Please wait a few minutes and try again.';
  }
  
  // If we have a detailed message, use it
  if (error.message) {
    message = error.message
      .replace(/\(#\d+\)/g, '')
      .trim();
  }
  
  return message;
};
