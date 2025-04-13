
import { BaseApiService } from './BaseApiService';
import { checkRateLimitStatus, markRateLimited } from '@/hooks/campaigns/fetch-utils/rateLimit';
import { shouldThrottleFetch } from '@/hooks/campaigns/fetch-utils/rateLimit';

/**
 * Represents filtering options for insights requests
 */
export interface InsightFilterOptions {
  datePreset?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_quarter' | 'lifetime' | 'last_30d' | 'last_14d' | 'last_7d';
  timeRange?: {
    since: string; // YYYY-MM-DD format
    until: string; // YYYY-MM-DD format
  };
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAIN' | 'NOT_CONTAIN' | 'ANY' | 'ALL' | 'NONE';
    value: string | string[] | number;
  }>;
  sort?: string; // e.g., 'reach_descending', 'spend_ascending'
  fields?: string[];
  attributionWindow?: ('1d_click' | '1d_view' | '7d_click' | '7d_view' | '28d_click' | '28d_view')[];
  breakdowns?: string[];
  limit?: number;
  useUnifiedAttribution?: boolean;
}

/**
 * Response interface for insights data
 */
export interface InsightsResponse {
  data: any[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
  summary?: {
    [key: string]: any;
  };
}

/**
 * Service for retrieving Meta Ads insights data
 */
export class MetaInsightsService extends BaseApiService {
  private static lastFetchTime: number = 0;
  
  /**
   * Fetches insights for a specific ad object (account, campaign, adset, or ad)
   */
  public static async fetchInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    try {
      console.log(`Fetching insights for object ${objectId}...`);
      this.validateToken(token, 'fetchInsights');
      
      // Apply throttling based on previous fetch time
      const now = Date.now();
      if (shouldThrottleFetch(this.lastFetchTime)) {
        console.log('Throttling insights fetch - too soon after last fetch');
        throw new Error('Rate limiting: Please wait before making another request');
      }
      
      // Check if we've recently hit a rate limit
      const rateStatus = checkRateLimitStatus();
      if (rateStatus.isRateLimited) {
        console.log(`Rate limit active, remaining time: ${rateStatus.timeRemaining} minutes`);
        throw new Error(`Meta API rate limit reached. Please wait approximately ${rateStatus.timeRemaining} more minutes.`);
      }
      
      // Update last fetch time
      this.lastFetchTime = now;
      
      // Build query parameters
      const params = new URLSearchParams();
      
      // Handle date parameters (mutual exclusion between timeRange and datePreset)
      if (options.timeRange) {
        params.append('time_range', JSON.stringify(options.timeRange));
      } else if (options.datePreset) {
        params.append('date_preset', options.datePreset);
      } else {
        // Default to last 30 days if no time range specified
        params.append('date_preset', 'last_30d');
      }
      
      // Add fields parameter
      if (options.fields && options.fields.length > 0) {
        params.append('fields', options.fields.join(','));
      }
      
      // Add level parameter
      if (options.level) {
        params.append('level', options.level);
      }
      
      // Add filtering parameter
      if (options.filtering && options.filtering.length > 0) {
        params.append('filtering', JSON.stringify(options.filtering));
      }
      
      // Add sorting parameter
      if (options.sort) {
        params.append('sort', options.sort);
      }
      
      // Add attribution windows
      if (options.attributionWindow && options.attributionWindow.length > 0) {
        params.append('action_attribution_windows', JSON.stringify(options.attributionWindow));
      }
      
      // Add unified attribution setting
      if (options.useUnifiedAttribution !== undefined) {
        params.append('use_unified_attribution_setting', options.useUnifiedAttribution.toString());
      }
      
      // Add breakdowns
      if (options.breakdowns && options.breakdowns.length > 0) {
        params.append('breakdowns', options.breakdowns.join(','));
      }
      
      // Add limit
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      // Add token
      params.append('access_token', token);
      
      // Build URL
      const url = `${this.BASE_URL}/${this.API_VERSION}/${objectId}/insights?${params.toString()}`;
      
      // Make the request with appropriate headers to improve client identification
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'meta-marketing-dashboard/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      // Capture response headers for rate limit monitoring
      this.captureResponseHeaders(response);
      
      // Check for rate limit headers
      const appUsage = response.headers.get('x-app-usage');
      if (appUsage) {
        try {
          const usage = JSON.parse(appUsage);
          // If we're over 80% of rate limit, log a warning
          if (usage.call_count > 80 || usage.total_cputime > 80 || usage.total_time > 80) {
            console.warn('Approaching Meta API rate limits:', usage);
          }
          
          // If we're at 100%, mark as rate limited
          if (usage.call_count >= 100 || usage.total_cputime >= 100 || usage.total_time >= 100) {
            markRateLimited();
          }
        } catch (e) {
          console.error('Error parsing API usage data:', e);
        }
      }
      
      // Process response
      const insights = await this.processApiResponse(response, 'fetchInsights');
      console.log(`Successfully fetched insights for ${objectId}`);
      
      return insights;
    } catch (error) {
      console.error(`Error fetching insights for object ${objectId}:`, error);
      
      // Check if this is a rate limit error and mark accordingly
      if (error instanceof Error && (
        error.message.includes('rate limit') || 
        error.message.includes('request limit') ||
        error.message.includes('too many calls')
      )) {
        markRateLimited();
      }
      
      throw error;
    }
  }
  
  /**
   * Fetch insights for a campaign
   */
  public static async fetchCampaignInsights(
    token: string,
    campaignId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for campaign level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'campaign_name',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'actions',
        'cost_per_action_type'
      ];
    }
    
    // Default level to campaign if not specified
    if (!options.level) {
      options.level = 'campaign';
    }
    
    return this.fetchInsights(token, campaignId, options);
  }
  
  /**
   * Fetch insights for an ad account
   */
  public static async fetchAccountInsights(
    token: string,
    accountId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Ensure adAccountId has the proper format with 'act_' prefix
    const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    
    // Set default fields for account level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'account_name',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'actions',
        'cost_per_action_type'
      ];
    }
    
    // Default level to account if not specified
    if (!options.level) {
      options.level = 'account';
    }
    
    return this.fetchInsights(token, formattedAccountId, options);
  }
  
  /**
   * Fetch insights for an ad set
   */
  public static async fetchAdSetInsights(
    token: string,
    adSetId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for ad set level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'adset_name',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'actions',
        'cost_per_action_type'
      ];
    }
    
    // Default level to adset if not specified
    if (!options.level) {
      options.level = 'adset';
    }
    
    return this.fetchInsights(token, adSetId, options);
  }
  
  /**
   * Fetch insights for an ad
   */
  public static async fetchAdInsights(
    token: string,
    adId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set default fields for ad level insights if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'ad_name',
        'spend',
        'impressions',
        'reach',
        'clicks',
        'ctr',
        'cpc',
        'cpm',
        'actions',
        'cost_per_action_type'
      ];
    }
    
    // Default level to ad if not specified
    if (!options.level) {
      options.level = 'ad';
    }
    
    return this.fetchInsights(token, adId, options);
  }
  
  /**
   * Fetch insights with demographic breakdowns
   */
  public static async fetchDemographicInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set breakdowns for demographic data
    options.breakdowns = [...(options.breakdowns || []), 'age', 'gender'];
    
    // Set default fields if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'impressions',
        'reach',
        'clicks',
        'spend',
        'actions'
      ];
    }
    
    return this.fetchInsights(token, objectId, options);
  }
  
  /**
   * Fetch insights with geographic breakdowns
   */
  public static async fetchGeographicInsights(
    token: string,
    objectId: string,
    options: InsightFilterOptions = {}
  ): Promise<InsightsResponse> {
    // Set breakdowns for geographic data
    options.breakdowns = [...(options.breakdowns || []), 'country'];
    
    // Set default fields if not provided
    if (!options.fields || options.fields.length === 0) {
      options.fields = [
        'impressions',
        'reach',
        'clicks',
        'spend',
        'actions'
      ];
    }
    
    return this.fetchInsights(token, objectId, options);
  }
}

export default MetaInsightsService;
