
// Map known Meta API error subcodes to user-friendly descriptions
const ERROR_SUBCODE_MAP: Record<number, string> = {
  // Token errors
  458: 'Your access token has expired. Please reconnect your Meta account.',
  459: 'Your access token has been revoked. Please reconnect your Meta account.',
  460: 'Your access token is missing required permissions. Make sure your token has ads_read and ads_management permissions.',
  463: 'Your token does not have permission to access this ad account. Please check account permissions.',
  464: 'You need to add the Business SDK permission to your app.',
  467: 'Token was created for a different application.',
  
  // Rate limiting errors
  1487125: 'Too many API requests in a short time. Please wait and try again.',
  1487182: 'Too many calls made to this ad account. Please wait and try again.',
  
  // Account errors
  1487195: 'The ad account is not accessible or has been deleted.',
  1487283: 'This ad account is in a different time zone than your business.',
  
  // Permission errors
  200: 'Permission error. Your account lacks required permissions for this operation.',
  10: 'Application does not have permission for this action.',
  
  // User-specific errors
  190: 'Invalid or expired access token. Please reconnect your Meta account.',
  104: 'Requires logging in to access this information.',
  270: 'The user is not a confirmed user.',
  
  // Input errors
  100: 'Invalid parameter or missing required parameter.',
};

export const getSubcodeDescription = (subcode: number): string | undefined => {
  return ERROR_SUBCODE_MAP[subcode];
};
