
/**
 * Meta API Call Logger
 * 
 * This utility intercepts and logs Meta API calls for debugging purposes.
 * It wraps the fetch API to capture Meta API calls.
 */

interface ApiCall {
  timestamp: string;
  url: string;
  method: string;
  params?: any;
  response?: any;
  error?: any;
}

// Initialize the calls array if it doesn't exist
if (typeof window !== 'undefined') {
  window.metaApiCalls = window.metaApiCalls || [];
}

// Store the original fetch function
const originalFetch = window.fetch;

// Function to check if a URL is a Meta API call
const isMetaApiCall = (url: string): boolean => {
  return url.includes('graph.facebook.com') || url.includes('api.facebook.com');
};

// Wrap the fetch function
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  // Convert input to string if it's a Request object
  const url = typeof input === 'string' ? input : input.url;
  
  // Check if this is a Meta API call
  if (typeof url === 'string' && isMetaApiCall(url)) {
    // Create call log entry
    const call: ApiCall = {
      timestamp: new Date().toISOString(),
      url: url,
      method: init?.method || 'GET',
      params: init?.body || null
    };
    
    // Track fetch attempt for campaign fetch
    if (url.includes('/campaigns') || url.includes('batch')) {
      const attemptEvent = new CustomEvent('campaign-fetch-attempt');
      window.dispatchEvent(attemptEvent);
    }
    
    try {
      // Make the original fetch call
      const response = await originalFetch(input, init);
      
      // Clone the response so we can read the body
      const responseClone = response.clone();
      
      try {
        // Try to parse the response as JSON
        const responseData = await responseClone.json();
        call.response = responseData;
      } catch (e) {
        // If not JSON, get text
        try {
          const textData = await responseClone.text();
          call.response = textData || 'Empty response';
        } catch (textError) {
          call.response = 'Could not read response';
        }
      }
      
      // Log the successful call
      console.log('[META API] Call success:', call.url);
      window.metaApiCalls.unshift(call);
      
      // Dispatch event for UI updates
      const event = new CustomEvent('meta-api-call', { detail: call });
      window.dispatchEvent(event);
      
      return response;
    } catch (error) {
      // Handle and log errors
      console.error('[META API] Call failed:', error);
      
      call.error = error;
      window.metaApiCalls.unshift(call);
      
      // Dispatch event for UI updates
      const event = new CustomEvent('meta-api-call', { detail: call });
      window.dispatchEvent(event);
      
      throw error;
    }
  }
  
  // Not a Meta API call, use original fetch
  return originalFetch(input, init);
};

export {};
