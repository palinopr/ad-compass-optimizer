
/**
 * Social Authentication Configuration
 * 
 * This file contains configuration settings for social authentication providers.
 * In a production environment, these values should ideally be stored in environment variables.
 */

export const FACEBOOK_APP_CONFIG = {
  // App ID for the Facebook application
  appId: "1356517842213704",
  
  // Permissions needed for ad account access
  // Note: These advanced permissions require app review by Meta
  // For development/testing, use only public_profile,email
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
// 5. Switch your app from Development to Live mode after completing app review

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

// Required permissions for ad account access
// These require Meta App Review before they can be used in production
export const FACEBOOK_AD_PERMISSIONS = {
  basic: "public_profile,email",
  advanced: "ads_management,ads_read,business_management",
  // Provide clear descriptions of what each permission allows
  descriptions: {
    ads_management: "Create, edit and manage ads",
    ads_read: "Read advertising account data",
    business_management: "Access Business Manager accounts"
  }
};
