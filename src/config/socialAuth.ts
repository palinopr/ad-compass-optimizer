
/**
 * Social Authentication Configuration
 * 
 * This file contains configuration settings for social authentication providers.
 * In a production environment, these values should ideally be stored in environment variables.
 */

export const FACEBOOK_APP_CONFIG = {
  // App ID for the Facebook application
  appId: "1349075236218599",
  
  // Permissions needed for the application including ad management permissions
  scope: "public_profile,email,ads_management,ads_read,business_management",
  
  // Basic permissions that work without app review
  basicScope: "public_profile,email",
  
  // Valid redirect URIs must be configured in the Facebook Developer Console
  // For development, localhost is typically allowed
  redirectUri: window.location.origin,
  
  // App version (must be a valid version supported by Facebook)
  version: "v22.0"
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

// Advanced permissions that require app review
export const FACEBOOK_AD_PERMISSIONS = {
  descriptions: {
    ads_management: "Create and manage ads",
    ads_read: "Read campaign and ad insights",
    business_management: "Manage business assets and permissions"
  },
  // Adding the missing scopes property
  scopes: [
    "ads_management",
    "ads_read", 
    "business_management",
    "pages_read_engagement",
    "pages_manage_ads",
    "instagram_basic",
    "instagram_manage_insights",
    "read_insights"
  ]
};

// Development mode status - set to false since app has completed app review
export const IS_DEV_MODE = false;
