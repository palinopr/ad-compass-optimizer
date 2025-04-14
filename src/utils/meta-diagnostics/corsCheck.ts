
export const checkForCorsIssues = async () => {
  try {
    const token = localStorage.getItem('meta_access_token');
    if (!token) {
      console.log('[META DEBUG] No token available for CORS check');
      return { hasCorsIssues: false, error: 'No token available' };
    }
    
    // Make a preflight request
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${token}`,
      { method: 'OPTIONS' }
    );
    
    console.log('[META DEBUG] CORS preflight response:', response.status, response.statusText);
    
    // Check response headers
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    };
    
    console.log('[META DEBUG] CORS headers:', corsHeaders);
    
    return { 
      hasCorsIssues: !corsHeaders['access-control-allow-origin'], 
      corsHeaders,
      error: '' // Adding empty error property to maintain consistent type
    };
  } catch (error) {
    console.error('[META DEBUG] ❌ CORS check error:', error);
    return { hasCorsIssues: true, error: String(error) };
  }
};

export const testProxyApproach = async () => {
  try {
    console.log('[META DEBUG] === TESTING PROXY APPROACH ===');
    
    // Get token
    const token = localStorage.getItem('meta_access_token');
    if (!token) {
      console.log('[META DEBUG] No token available for proxy test');
      return { 
        success: false, 
        proxyTested: false, 
        proxyWorked: false,
        error: 'No token available for proxy test' 
      };
    }
    
    // Use cors-anywhere demo proxy (note: this is rate-limited and for testing only)
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://graph.facebook.com/v22.0/me`;
    const proxyUrl = `${corsProxy}${apiUrl}?access_token=${token}`;
    
    console.log('[META DEBUG] Testing CORS proxy with:', corsProxy);
    
    // First try to get temporary access to the proxy (required for cors-anywhere)
    try {
      console.log('[META DEBUG] Attempting to get proxy access');
      const proxyCheckResponse = await fetch(corsProxy);
      const proxyText = await proxyCheckResponse.text();
      console.log('[META DEBUG] Proxy access check response:', proxyText);
      
      // Check if the response contains the expected access message
      if (proxyText.includes('denied') || proxyText.includes('blocked')) {
        console.log('[META DEBUG] Proxy access denied');
        return { 
          success: false, 
          proxyTested: true, 
          proxyWorked: false,
          error: 'Proxy access denied. Visit the proxy service to request temporary access.' 
        };
      }
    } catch (e) {
      console.log('[META DEBUG] Proxy access check failed:', e);
    }
    
    // Now try the actual proxy request
    console.log('[META DEBUG] Making proxied request to:', apiUrl);
    const proxyResponse = await fetch(proxyUrl, {
      headers: {
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest' // Required by many CORS proxies
      }
    });
    
    console.log('[META DEBUG] Proxy response status:', proxyResponse.status, proxyResponse.statusText);
    
    if (!proxyResponse.ok) {
      console.log('[META DEBUG] Proxy request failed with status:', proxyResponse.status);
      return { 
        success: false, 
        proxyTested: true, 
        proxyWorked: false,
        error: `Proxy request failed with status: ${proxyResponse.status}` 
      };
    }
    
    // Get response as text first
    const responseText = await proxyResponse.text();
    console.log('[META DEBUG] Raw proxy response:', responseText.substring(0, 100) + (responseText.length > 100 ? '...' : ''));
    
    // Check if the response is empty
    if (!responseText.trim()) {
      return { 
        success: false, 
        proxyTested: true, 
        proxyWorked: false,
        error: 'Empty response from proxy' 
      };
    }
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      if (data.error) {
        return { 
          success: false, 
          proxyTested: true, 
          proxyWorked: false,
          error: data.error.message || 'API error via proxy' 
        };
      } else {
        console.log('[META DEBUG] Proxy approach succeeded!');
        return { 
          success: true, 
          proxyTested: true, 
          proxyWorked: true,
          data,
          error: ''
        };
      }
    } catch (e) {
      console.error('[META DEBUG] ❌ JSON parse error:', e, 'Response was:', responseText.substring(0, 150));
      return { 
        success: false, 
        proxyTested: true, 
        proxyWorked: false,
        error: `Failed to parse proxy response: ${e.message}` 
      };
    }
  } catch (error) {
    console.error('[META DEBUG] ❌ Proxy approach test error:', error);
    return { 
      success: false, 
      proxyTested: true, 
      proxyWorked: false,
      error: String(error) 
    };
  } finally {
    console.log('[META DEBUG] === END PROXY TEST ===');
  }
};

