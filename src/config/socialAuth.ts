
/**
 * Social Authentication Configuration
 * 
 * This file contains configuration settings for social authentication providers.
 * In a production environment, these values should ideally be stored in environment variables.
 */

export const FACEBOOK_APP_CONFIG = {
  // App ID for the Facebook application
  appId: "1356517842213704",
  
  // Required permissions (use minimal permissions to improve approval rates)
  scope: "public_profile,email",
  
  // Valid redirect URIs must be configured in the Facebook Developer Console
  // For development, localhost is typically allowed
  redirectUri: window.location.origin,
  
  // App version (optional)
  version: "v18.0"
};

// Facebook app setup instructions:
// 1. Go to https://developers.facebook.com/apps/
// 2. Create a new app with the "Business" type
// 3. Add the "Facebook Login" product
// 4. Configure the valid OAuth redirect URIs in settings
// 5. Request app review if using permissions beyond basic
