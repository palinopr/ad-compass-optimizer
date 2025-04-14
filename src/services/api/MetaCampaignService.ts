
import { BaseApiService } from './BaseApiService';
import { InsightsThrottling } from './insights/throttling';

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: string;
  results: string;
  cost_per_result: string;
  budget: string;
  daily_budget: string;
  lifetime_budget: string;
  start_time: string;
  end_time: string | null;
  created_time: string;
  updated_time: string;
  insights?: {
    cpa?: string;
    roas?: string;
    impressions?: string;
    clicks?: string;
  };
}

export class MetaCampaignService extends BaseApiService {
  /**
   * Fetch campaigns for a specific ad account
   */
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      console.log(`Fetching campaigns for ad account ${adAccountId}...`);
      this.validateToken(token, 'fetchCampaigns');
      
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }
      
      // Ensure ad account ID has the proper format with 'act_' prefix
      const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // Track the fetch attempt for debugging
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', formattedAccountId);
      
      // Debug: log API call details
      console.log(`Making API call to Meta Graph API for account ${formattedAccountId}`);
      console.log(`API URL: ${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns`);
      console.log(`Token length: ${token.length} characters`);
      
      // Apply throttling check
      try {
        InsightsThrottling.checkThrottling(formattedAccountId);
      } catch (throttleErr) {
        console.warn('Throttling protection triggered:', throttleErr.message);
        throw throttleErr;
      }
      
      // Get basic campaign data first
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=id,name,objective,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget&access_token=${token}&debug=all&limit=500`,
        // Adding additional headers to improve client identification
        {
          headers: {
            'User-Agent': 'meta-marketing-dashboard/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-App-Usage': JSON.stringify({ call_count: 0, total_time: 0, total_cputime: 0 }),
            'Cache-Control': 'no-cache'
          },
          // Adding cache control
          cache: 'no-store'
        }
      );
      
      // Debug: log response status
      console.log(`API response status: ${response.status} ${response.statusText}`);
      
      // Debug: log response headers
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
        if (key.toLowerCase().includes('x-')) {
          console.log(`Header: ${key}: ${value}`);
        }
      });
      
      // Capture response headers for rate limit monitoring
      this.captureResponseHeaders(response);
      InsightsThrottling.monitorResponseHeaders(response);
      
      // Debug: Check if the response is ok before parsing
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`API error details: ${errorText}`);
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      
      const campaignsData = await this.processApiResponse(response, 'fetchCampaigns');
      
      // Debug: Log raw response for inspection
      console.log('API Raw Response:', campaignsData);
      
      // Handle empty data field
      if (!campaignsData.data && campaignsData.error) {
        console.error('API returned error:', campaignsData.error);
        throw new Error(`API Error: ${campaignsData.error.message || JSON.stringify(campaignsData.error)}`);
      }
      
      const campaigns = campaignsData.data || [];
      
      if (campaigns.length === 0) {
        console.log('No campaigns found for this ad account');
        
        // Store metadata for diagnostics
        localStorage.setItem('last_campaign_count', '0');
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_empty_result', 'true');
        
        // Try fetching adsets to verify API is working correctly
        await this.verifyAdAccountAccess(token, formattedAccountId);
        
        return [];
      }
      
      console.log(`Found ${campaigns.length} campaigns`);
      
      // Store metadata for diagnostics
      localStorage.setItem('last_campaign_count', campaigns.length.toString());
      localStorage.setItem('last_campaign_fetch_success', 'true');
      localStorage.removeItem('last_empty_result');
      
      // Map basic campaign data (without insights)
      const campaignsWithBasicInfo = campaigns.map(campaign => {
        return {
          ...campaign,
          spend: '$0.00',
          results: '0',
          budget: campaign.daily_budget ? 
            '$' + (parseInt(campaign.daily_budget) / 100).toFixed(2) + '/day' : 
            (campaign.lifetime_budget ? 
              '$' + (parseInt(campaign.lifetime_budget) / 100).toFixed(2) + ' total' : 
              '-'),
          insights: {
            cpa: '-',
            roas: '-',
            impressions: '0',
            clicks: '0'
          }
        };
      });
      
      // Try to fetch insights, but don't fail the whole request if insights fetch fails
      try {
        // Implementing Meta's rate limit best practice: 
        // Using filters to limit data response size and avoid calls that request overlapping data
        if (campaigns.length > 0) {
          // Get a smaller batch of campaign IDs if there are many (to avoid rate limits)
          const campaignBatchSize = campaigns.length > 20 ? 20 : campaigns.length;
          const campaignIds = campaigns.slice(0, campaignBatchSize).map(campaign => campaign.id).join(',');
          
          console.log(`Fetching insights for ${campaignBatchSize} campaigns: ${campaignIds}`);
          
          // Using a simpler insights request with more filtering to avoid potential errors
          const insightsResponse = await fetch(
            `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/insights?level=campaign&fields=campaign_id,spend,impressions,clicks,cpc&time_range[since]=2020-01-01&time_range[until]=2030-12-31&access_token=${token}&debug=all`,
            {
              headers: {
                'User-Agent': 'meta-marketing-dashboard/1.0',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              cache: 'no-store'
            }
          );
          
          // Also capture headers from the insights call
          this.captureResponseHeaders(insightsResponse);
          InsightsThrottling.monitorResponseHeaders(insightsResponse);
          
          if (!insightsResponse.ok) {
            console.warn(`Insights fetch returned status ${insightsResponse.status}. Will continue with basic campaign data.`);
            // Return the campaigns without insights rather than failing
            return campaignsWithBasicInfo;
          }
          
          const insightsData = await this.processApiResponse(insightsResponse, 'fetchCampaignInsights');
          
          console.log('Insights data:', insightsData);
          const insights = insightsData.data || [];
          
          // Map insights data to campaigns
          return campaignsWithBasicInfo.map(campaign => {
            const campaignInsights = insights.find(insight => insight.campaign_id === campaign.id);
            
            if (campaignInsights) {
              // Parse spend from insights
              const spend = campaignInsights.spend || '0';
              const impressions = campaignInsights.impressions || '0';
              const clicks = campaignInsights.clicks || '0';
              const cpc = campaignInsights.cpc || '0';
              
              // Calculate CPA (assuming CPA is cost per click here)
              const cpa = parseFloat(spend) > 0 && parseInt(clicks) > 0 
                ? (parseFloat(spend) / parseInt(clicks)).toFixed(2)
                : '0.00';
                
              return {
                ...campaign,
                spend: '$' + parseFloat(spend).toFixed(2),
                results: clicks,
                cost_per_result: '$' + parseFloat(cpc || '0').toFixed(2),
                insights: {
                  ...campaign.insights,
                  impressions,
                  clicks,
                  cpa: '$' + cpa
                }
              };
            }
            
            return campaign;
          });
        }
      } catch (insightsError) {
        console.error('Error fetching campaign insights:', insightsError);
        console.log('Returning campaigns without insights data');
        // Return the campaigns without insights rather than failing
      }
      
      return campaignsWithBasicInfo;
    } catch (error) {
      console.error(`Error fetching campaigns for ad account ${adAccountId}:`, error);
      
      // Set error flags for diagnostics
      localStorage.setItem('last_campaign_fetch_success', 'false');
      localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        console.error('This appears to be a permissions error. For campaign access, your token needs ads_read permission.');
      }
      
      // Check if it's a rate limiting error
      if (InsightsThrottling.checkErrorForRateLimit(error)) {
        console.warn('Rate limit error detected and recorded');
      }
      
      return this.handleApiError(error, 'fetchCampaigns');
    }
  }
  
  /**
   * Verify access to the ad account by fetching adsets
   * This is a fallback check when campaigns are not found
   */
  private static async verifyAdAccountAccess(token: string, adAccountId: string): Promise<void> {
    try {
      console.log(`Verifying ad account access by fetching adsets for ${adAccountId}...`);
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${adAccountId}/adsets?fields=id,name&limit=10&access_token=${token}`,
        {
          headers: {
            'User-Agent': 'meta-marketing-dashboard/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.warn(`Adsets verification failed with status ${response.status}`);
        localStorage.setItem('adsets_verification_failed', 'true');
        return;
      }
      
      const adsetsData = await this.processApiResponse(response, 'verifyAdAccountAccess');
      const adsets = adsetsData.data || [];
      
      console.log(`Found ${adsets.length} adsets`);
      
      localStorage.setItem('has_adsets', adsets.length > 0 ? 'true' : 'false');
      localStorage.setItem('adset_count', adsets.length.toString());
    } catch (error) {
      console.error('Error verifying ad account access:', error);
      localStorage.setItem('adsets_verification_error', error instanceof Error ? error.message : String(error));
    }
  }
}

export default MetaCampaignService;
