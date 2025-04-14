
/**
 * Configuration for mock API services
 */
export const MOCK_CONFIG = {
  FLAG: 'mockMeta',
  STORAGE_KEY: 'USE_MOCK_META_API'
};

export class MockConfig {
  public static isMockMetaApiMode(): boolean {
    // Check URL parameter for immediate activation
    const urlParams = new URLSearchParams(window.location.search);
    const mockEnabled = urlParams.get(MOCK_CONFIG.FLAG) === 'true';
    
    // Store the setting in localStorage if URL param is set
    if (mockEnabled) {
      localStorage.setItem(MOCK_CONFIG.STORAGE_KEY, 'true');
      console.log('🎭 Meta API Mock Mode activated via URL parameter');
    }
    
    // Check localStorage for persistent setting
    return mockEnabled || localStorage.getItem(MOCK_CONFIG.STORAGE_KEY) === 'true';
  }

  public static disableMockMode(): void {
    localStorage.removeItem(MOCK_CONFIG.STORAGE_KEY);
    console.log('🎭 Meta API Mock Mode disabled');
  }
}

