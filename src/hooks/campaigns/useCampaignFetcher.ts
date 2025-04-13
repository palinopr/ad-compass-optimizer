
import { useCallback } from 'react';
import { MetaApiService } from '@/services/MetaApiService';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

export function useCampaignFetcher() {
  const { toast } = useToast();

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    try {
      // Log the auth method being used
      const authMethod = metaAuthService.getTokenSource();
      console.log(`Using auth method: ${authMethod} for ad account: ${adAccountId}`);
      
      // Track fetch attempt for diagnostics
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      
      console.log(`Fetching campaigns for ad account: ${adAccountId}`);
      
      // Check if we've recently hit a rate limit
      const rateLimitTime = localStorage.getItem('meta_rate_limit_timestamp');
      if (rateLimitTime) {
        const limitTime = new Date(rateLimitTime).getTime();
        const now = new Date().getTime();
        const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
        
        // If rate limited in the last 5 minutes, inform the user
        if (minutesSince < 5) {
          console.log(`Rate limit detected ${minutesSince} minutes ago. Advising to wait.`);
          const remainingTime = 5 - minutesSince;
          
          toast({
            title: "Rate Limit Detected",
            description: `Facebook's API is rate limited. Please wait approximately ${remainingTime} more minutes.`,
            duration: 7000,
          });
          
          return { 
            campaigns: [], 
            error: `Meta API rate limit reached. Please wait approximately ${remainingTime} more minutes and try again.`,
            errorDetails: { 
              code: 4,
              isRateLimit: true,
              timeRemaining: remainingTime
            }
          };
        } else {
          // Clear the rate limit flag if it's been more than 5 minutes
          localStorage.removeItem('meta_rate_limit_timestamp');
        }
      }
      
      try {
        const campaignsData = await MetaApiService.fetchCampaigns(token, adAccountId);
        console.log('Campaigns data received:', campaignsData?.length || 0, 'campaigns');
        
        // Record successful fetch for diagnostics
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_count', String(campaignsData?.length || 0));
        
        // Filter by status if provided
        let filteredCampaigns = campaignsData;
        if (status && campaignsData) {
          console.log(`Filtering campaigns by status: ${status}`);
          if (status === 'active') {
            filteredCampaigns = campaignsData.filter(c => c.status === 'ACTIVE');
          } else if (status === 'draft') {
            filteredCampaigns = campaignsData.filter(c => c.status === 'PAUSED');
          } else if (status === 'archived') {
            filteredCampaigns = campaignsData.filter(c => c.status === 'ARCHIVED' || c.status === 'DELETED');
          }
          console.log(`After filtering: ${filteredCampaigns?.length || 0} campaigns`);
        }
        
        return { campaigns: filteredCampaigns || [], error: null };
      } catch (apiErr: any) {
        console.error('API error during campaign fetch:', apiErr);
        
        // Record failed fetch for diagnostics
        localStorage.setItem('last_campaign_fetch_success', 'false');
        
        let apiErrorMessage = apiErr?.message || 'Unknown API error';
        let errorDetails = null;
        
        // Enhanced error capture - extract Facebook API errors from response
        if (apiErr?.response) {
          try {
            const responseData = await apiErr.response.json();
            console.error('API error response data:', responseData);
            
            // Store the complete error details
            errorDetails = responseData;
            
            // Check for rate limit errors
            if (responseData.error && 
                (responseData.error.code === 4 || 
                 responseData.error.message?.includes('rate limit') || 
                 responseData.error.message?.includes('request limit'))) {
              
              console.log('Rate limit error detected');
              localStorage.setItem('meta_rate_limit_timestamp', new Date().toISOString());
              
              apiErrorMessage = 'Meta API rate limit reached. Please wait 5-10 minutes before trying again.';
            }
            else if (responseData.error && responseData.error.message) {
              apiErrorMessage = responseData.error.message;
              
              // Add more context based on error code
              if (responseData.error.code === 200) {
                apiErrorMessage += " (Permission error)";
              } else if (responseData.error.code === 100) {
                apiErrorMessage += " (Invalid parameter)";
              } else if (responseData.error.code === 190) {
                apiErrorMessage += " (Invalid/expired access token)";
              } 
            }
          } catch (jsonErr) {
            console.error('Failed to parse API error response:', jsonErr);
          }
        }
        
        // Store error details for diagnostics
        localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
          message: apiErrorMessage,
          timestamp: new Date().toISOString(),
          details: errorDetails
        }));
        
        throw { message: apiErrorMessage, details: errorDetails };
      }
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      
      // Check for rate limit messages in the error
      if (err.message && 
          (err.message.includes('rate limit') || 
           err.message.includes('request limit') ||
           (err.details?.error?.code === 4))) {
        
        console.log('Rate limit error detected in catch block');
        
        // Store rate limit timestamp if not already stored
        if (!localStorage.getItem('meta_rate_limit_timestamp')) {
          localStorage.setItem('meta_rate_limit_timestamp', new Date().toISOString());
        }
        
        // Show specific toast for rate limiting - Fixed to use "destructive" instead of "warning"
        toast({
          title: "API Rate Limit",
          description: "Meta API is rate limited. Please wait 5-10 minutes before trying again.",
          variant: "destructive",
          duration: 10000
        });
        
        return { 
          campaigns: [], 
          error: 'Meta API rate limit reached. Please wait 5-10 minutes before trying again.',
          errorDetails: err?.details || {
            error: {
              code: 4,
              message: 'Application request limit reached',
              isRateLimit: true
            }
          }
        };
      }
      
      const errorMessage = err?.message || (err instanceof Error ? err.message : 'Failed to fetch campaigns');
      
      // Enhanced error storage for troubleshooting
      let errorDetails = err?.details || {
        error: {
          message: errorMessage,
          timestamp: new Date().toISOString()
        }
      };
      
      // Try to extract HTTP error code for more specific errors
      let enhancedError = errorMessage;
      if (typeof errorMessage === 'string') {
        // Extract error code if present
        const errorCodeMatch = errorMessage.match(/(\d{3})/);
        if (errorCodeMatch && errorCodeMatch[0]) {
          const errorCode = errorCodeMatch[0];
          
          if (errorCode === '400') {
            enhancedError = 'Failed to fetch campaign data (Error 400). This usually indicates an invalid token format or expired token.';
          } else if (errorCode === '401') {
            enhancedError = 'Authentication failed (Error 401). Your Meta access token has expired.';
          } else if (errorCode === '403') {
            enhancedError = 'Permission denied (Error 403). You don\'t have the required permissions to access this data.';
          }
        }
      }
      
      // Show toast notification with more friendly error message
      toast({
        title: "Error Loading Campaigns",
        description: "There was a problem loading your campaign data. Please check your connection.",
        variant: "destructive"
      });
      
      return { campaigns: [], error: enhancedError, errorDetails };
    }
  }, [toast]);

  return { fetchCampaignData };
}
