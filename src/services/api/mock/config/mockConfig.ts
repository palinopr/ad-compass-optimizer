
/**
 * Configuration for mock API services
 */
export const MOCK_CONFIG = {
  FLAG: 'mockMeta',
  STORAGE_KEY: 'USE_MOCK_META_API'
};

export class MockConfig {
  public static isMockMetaApiMode(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      
      // Check URL parameter for immediate activation
      const urlParams = new URLSearchParams(window.location.search);
      const mockEnabled = urlParams.get(MOCK_CONFIG.FLAG) === 'true';
      
      // Store the setting in localStorage if URL param is set
      if (mockEnabled) {
        try {
          localStorage.setItem(MOCK_CONFIG.STORAGE_KEY, 'true');
          console.log('🎭 Meta API Mock Mode activated via URL parameter');
        } catch (storageError) {
          console.error("Error storing mock mode in localStorage:", storageError);
        }
      }
      
      // Check localStorage for persistent setting
      try {
        return mockEnabled || localStorage.getItem(MOCK_CONFIG.STORAGE_KEY) === 'true';
      } catch (readError) {
        console.error("Error reading mock mode from localStorage:", readError);
        return mockEnabled;
      }
    } catch (e) {
      console.error("Error in isMockMetaApiMode:", e);
      return false;
    }
  }

  public static disableMockMode(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(MOCK_CONFIG.STORAGE_KEY);
          console.log('🎭 Meta API Mock Mode disabled');
        } catch (e) {
          console.error("Error removing from localStorage:", e);
        }
      }
    } catch (e) {
      console.error("Error disabling mock mode:", e);
    }
  }
}
