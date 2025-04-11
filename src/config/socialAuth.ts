
/**
 * Social Authentication Configuration
 * 
 * This file contains configuration settings for social authentication providers.
 * In a production environment, these values should ideally be stored in environment variables.
 */

export const FACEBOOK_APP_CONFIG = {
  // App ID for the Facebook application
  appId: "1356517842213704",
  
  // Permissions needed for the application
  // Based on the app configuration shown in screenshot
  scope: "public_profile,email",
  
  // Valid redirect URIs must be configured in the Facebook Developer Console
  // For development, localhost is typically allowed
  redirectUri: window.location.origin,
  
  // App version (must be a valid version supported by Facebook)
  version: "v17.0"
};

// Required Facebook App Configuration for Production Use:
// 1. Create a business app at https://developers.facebook.com/apps/
// 2. Add "Facebook Login" product to your app
// 3. Configure these REQUIRED settings in your Facebook App:
//    - Privacy Policy URL: Link to your privacy policy page
//    - App Domains: Add all domains where your app will run
//    - Valid OAuth Redirect URIs: Add all callback URLs (including localhost for dev)
// 4. Complete the "Authenticate and request data from users with Facebook Login" use case

export const FACEBOOK_LOGIN_REQUIREMENTS = {
  requiredSettings: [
    "Privacy Policy URL",
    "App Domains",
    "Valid OAuth Redirect URIs",
    "Terms of Service URL (recommended)"
  ],
  requiredPages: [
    "Privacy Policy",
    "Terms of Service",
    "Data Deletion Instructions"
  ]
};

// The Meta App supports these use cases per the screenshot:
export const FACEBOOK_USE_CASES = {
  adsManager: "Create & manage app ads with Meta Ads Manager",
  facebookLogin: "Authenticate and request data from users with Facebook Login"
};
