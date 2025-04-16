
/**
 * Utility to compare and debug token formats
 */
export class TokenFormatDebugger {
  /**
   * Compare the token format used in different API requests to debug inconsistencies
   */
  static compareTokenFormats(): { 
    mismatch: boolean;
    details: Record<string, any>;
  } {
    try {
      // Read stored token formats
      const lastTokenFormat = localStorage.getItem('last_token_format');
      const insightsTokenFormat = localStorage.getItem('insights_token_format');
      
      if (!lastTokenFormat || !insightsTokenFormat) {
        return {
          mismatch: false,
          details: {
            error: 'Missing token format information',
            hasInsightsToken: !!insightsTokenFormat,
            hasProfileToken: !!lastTokenFormat
          }
        };
      }
      
      // Parse stored formats
      const profileToken = JSON.parse(lastTokenFormat);
      const insightsToken = JSON.parse(insightsTokenFormat);
      
      // Compare formats
      const mismatch = 
        profileToken.length !== insightsToken.length ||
        profileToken.prefix !== insightsToken.prefix ||
        profileToken.suffix !== insightsToken.suffix;
      
      return {
        mismatch,
        details: {
          profile: {
            length: profileToken.length,
            prefix: profileToken.prefix,
            suffix: profileToken.suffix,
            timestamp: profileToken.timestamp
          },
          insights: {
            length: insightsToken.length,
            prefix: insightsToken.prefix,
            suffix: insightsToken.suffix,
            timestamp: insightsToken.timestamp
          },
          timeDiff: new Date(profileToken.timestamp).getTime() - new Date(insightsToken.timestamp).getTime()
        }
      };
    } catch (error) {
      console.error('Error comparing token formats:', error);
      return {
        mismatch: false,
        details: { error: 'Error comparing token formats' }
      };
    }
  }
  
  /**
   * Log token format for insights requests
   */
  static logInsightsToken(token: string) {
    if (!token) return;
    
    try {
      localStorage.setItem('insights_token_format', JSON.stringify({
        length: token.length,
        prefix: token.substring(0, 4),
        suffix: token.substring(token.length - 4),
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error logging insights token format:', error);
    }
  }
}
