
import { metaAuthService } from '@/services/MetaAuthService';
import { BaseApiService } from '@/services/api/BaseApiService';

/**
 * Run a final diagnostic check before making API requests
 * This helps prevent known error conditions
 */
export const runFinalDiagnosticCheck = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check token
    const token = metaAuthService.getAccessToken();
    if (!token || token.length < 50) {
      return { 
        success: false, 
        error: 'No valid Meta access token found' 
      };
    }
    
    // Check selected ad account
    const adAccountId = localStorage.getItem('selected_ad_account');
    if (!adAccountId) {
      return { 
        success: false, 
        error: 'No ad account selected' 
      };
    }
    
    // Test basic connection to Meta API
    try {
      const MetaApiService = (await import('@/services/api/MetaApiService')).default;
      const result = await MetaApiService.testConnection(token);
      
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Connection test failed' 
        };
      }
    } catch (e: any) {
      return { 
        success: false, 
        error: `API connection failed: ${e.message}` 
      };
    }
    
    // All checks passed
    return { success: true };
  } catch (e: any) {
    return { 
      success: false, 
      error: `Diagnostic check failed: ${e.message}` 
    };
  }
};
