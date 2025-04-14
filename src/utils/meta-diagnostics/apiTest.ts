
export const testMetaApi = async () => {
  try {
    console.log('[META DEBUG] === META API TEST ===');
    
    // Get token
    const token = localStorage.getItem('meta_access_token');
    console.log('[META DEBUG] Token available:', !!token);
    
    if (!token) {
      console.log('[META DEBUG] No token found, cannot proceed with API test');
      return { success: false, error: 'No token available' };
    }
    
    // Make a simple API call to /me endpoint
    console.log('[META DEBUG] Making API call to /me endpoint...');
    
    const apiVersion = 'v22.0'; // Make sure this matches your app's API version
    const url = `https://graph.facebook.com/${apiVersion}/me?access_token=${token}`;
    
    console.log('[META DEBUG] API URL:', url.replace(token, '[TOKEN HIDDEN]'));
    
    // Make the request
    const response = await fetch(url);
    
    console.log('[META DEBUG] Response status:', response.status, response.statusText);
    
    // Get response as text
    const responseText = await response.text();
    console.log('[META DEBUG] Raw response:', responseText);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('[META DEBUG] Parsed response:', data);
      
      if (data.error) {
        console.log('[META DEBUG] API returned error:', data.error);
        return { success: false, error: data.error };
      }
      
      console.log('[META DEBUG] API call successful');
      return { success: true, data, error: '' }; // Adding empty error property
    } catch (parseError) {
      console.log('[META DEBUG] Failed to parse response as JSON:', parseError);
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.log('[META DEBUG] API test error:', error);
    return { success: false, error: String(error) };
  } finally {
    console.log('[META DEBUG] === END API TEST ===');
  }
};

