
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { isRateLimitError } from './rateLimitDetection';
import { markRateLimited } from './rateLimitStatus';

/**
 * Process API fetch errors
 */
export const processFetchError = (err: any) => {
  console.error('Campaign fetch error:', err);
  
  // Save error info for troubleshooting
  try {
    localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
      message: err.message || String(err),
      code: err.code || null,
      type: err.type || null,
      stack: err.stack || null
    }));
    localStorage.setItem('last_campaign_fetch_success', 'false');
    localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
  } catch (e) {
    console.error('Error saving fetch error data:', e);
  }
  
  // Check for rate limit errors
  const isRateLimit = isRateLimitError(err);
  if (isRateLimit) {
    markRateLimited();
    
    return {
      error: `Meta API rate limit reached. Please wait approximately 10 minutes and try again.`,
      errorDetails: { 
        isRateLimit: true,
        code: err.code || null,
        message: err.message || String(err)
      }
    };
  }
  
  return {
    error: err.message || String(err),
    errorDetails: {
      error: err,
      isRateLimit: false
    }
  };
};

/**
 * Execute campaign fetch through Meta API
 */
export const executeCampaignFetch = async (token: string, adAccountId: string): Promise<MetaCampaign[]> => {
  // Format the ad account ID if needed
  const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  
  // Set up API endpoint
  const apiUrl = `https://graph.facebook.com/v17.0/${formattedId}/campaigns`;
  const params = new URLSearchParams({
    access_token: token,
    fields: 'id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,spend_cap',
    limit: '500'
  });
  
  console.log(`Fetching campaigns for account: ${formattedId}`);
  
  try {
    // Save attempt timestamp
    localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
    
    // Make the API request
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw {
        message: errorData.error?.message || `API error: ${response.status}`,
        code: errorData.error?.code || response.status,
        type: errorData.error?.type || 'ApiError',
        details: errorData
      };
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response format');
    }
    
    // Save success status to localStorage
    localStorage.setItem('last_campaign_fetch_success', 'true');
    localStorage.setItem('last_campaign_count', data.data.length.toString());
    
    return data.data as MetaCampaign[];
  } catch (err) {
    throw err; // Let calling code handle the error
  }
};

/**
 * Filter campaigns by status
 */
export const filterCampaignsByStatus = (campaigns: MetaCampaign[], status?: string): MetaCampaign[] => {
  if (!status) return campaigns;
  
  return campaigns.filter(campaign => {
    if (status === 'active' && campaign.status === 'ACTIVE') {
      return true;
    }
    if (status === 'draft' && campaign.status === 'PAUSED') {
      return true;
    }
    if (status === 'archived' && campaign.status === 'ARCHIVED') {
      return true;
    }
    return false;
  });
};
