
// API Testing utilities

export const testMetaApi = async () => {
  try {
    console.log('=== META API TEST ===');
    
    // Get token
    const token = localStorage.getItem('meta_access_token');
    console.log('Token available:', !!token);
    
    if (!token) {
      console.log('No token found, cannot proceed with API test');
      return { success: false, error: 'No token available' };
    }
    
    // Make a simple API call to /me endpoint
    console.log('Making API call to /me endpoint...');
    
    const apiVersion = 'v22.0'; // Make sure this matches your app's API version
    const url = `https://graph.facebook.com/${apiVersion}/me?access_token=${token}`;
    
    console.log('API URL:', url.replace(token, '[TOKEN HIDDEN]'));
    
    // Make the request
    const response = await fetch(url);
    
    console.log('Response status:', response.status, response.statusText);
    
    // Get response as text
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
      
      if (data.error) {
        console.log('API returned error:', data.error);
        return { success: false, error: data.error };
      }
      
      console.log('API call successful');
      return { success: true, data, error: '' }; // Adding empty error property
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', parseError);
      return { success: false, error: 'Invalid JSON response' };
    }
  } catch (error) {
    console.log('API test error:', error);
    return { success: false, error: String(error) };
  } finally {
    console.log('=== END API TEST ===');
  }
};
