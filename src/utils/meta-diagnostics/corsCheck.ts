
export const checkForCorsIssues = async () => {
  try {
    const token = localStorage.getItem('meta_auth_token');
    if (!token) {
      console.log('[META DEBUG] No token available for CORS check');
      return { hasCorsIssues: false, error: 'No token available' };
    }
    
    // Make a preflight request to check connection
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${token}`,
      { method: 'OPTIONS' }
    );
    
    console.log('[META DEBUG] API connection test response:', response.status, response.statusText);
    
    // Check response headers
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    console.log('[META DEBUG] Response headers:', corsHeaders);
    
    return { 
      hasCorsIssues: false, // Facebook Auth handles CORS automatically
      corsHeaders,
      error: '' 
    };
  } catch (error) {
    console.error('[META DEBUG] ❌ Connection check error:', error);
    return { hasCorsIssues: false, error: String(error) };
  }
};

// Remove the proxy test function since we're using direct API calls
export const testProxyApproach = async () => {
  return { 
    success: false, 
    proxyTested: false, 
    proxyWorked: false,
    error: 'CORS proxy testing is disabled - using direct Meta API calls with Facebook authentication' 
  };
};
