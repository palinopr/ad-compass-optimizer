
import { MetaUserService } from './api/MetaUserService';
import { MetaAdAccountService } from './api/MetaAdAccountService';
import { MetaBusinessService } from './api/MetaBusinessService';
import { MetaConnectionService } from './api/MetaConnectionService';
import MetaCampaignService, { MetaCampaign } from './api/MetaCampaignService';
import MetaInsightsService, { InsightFilterOptions, InsightsResponse } from './api/MetaInsightsService';
import type { ConnectionTestResult } from './api/MetaConnectionService';

/**
 * Meta API Service
 * This class delegates to specialized service classes for different API operations
 */
export class MetaApiService {
  private static readonly API_VERSION = 'v17.0';
  private static readonly BASE_URL = 'https://graph.facebook.com';

  /**
   * Fetch user data using a Meta access token
   */
  public static async fetchUserData(token: string) {
    return MetaUserService.fetchUserData(token);
  }

  /**
   * Fetch ad accounts for the authenticated user
   */
  public static async fetchAdAccounts(token: string) {
    return MetaAdAccountService.fetchAdAccounts(token);
  }

  /**
   * Fetch details for a specific ad account by ID
   */
  public static async fetchAdAccountDetails(token: string, accountId: string) {
    return MetaAdAccountService.fetchAdAccountDetails(token, accountId);
  }

  /**
   * Test Meta API connection with the provided token
   */
  public static async testConnection(token: string): Promise<ConnectionTestResult> {
    return MetaConnectionService.testConnection(token);
  }

  /**
   * Fetch business managers for the authenticated user
   */
  public static async fetchBusinessManagers(token: string) {
    return MetaBusinessService.fetchBusinessManagers(token);
  }

  /**
   * Fetch ad accounts for a specific business manager
   */
  public static async fetchAdAccountsForBusiness(token: string, businessId: string) {
    return MetaAdAccountService.fetchAdAccountsForBusiness(token, businessId);
  }
  
  /**
   * Fetch campaigns for a specific ad account
   */
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    return MetaCampaignService.fetchCampaigns(token, adAccountId);
  }

  /**
   * Fetch insights for any Meta ad object
   */
  public static async fetchInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return MetaInsightsService.fetchInsights(token, objectId, options);
  }

  /**
   * Fetch insights for a campaign
   */
  public static async fetchCampaignInsights(token: string, campaignId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return MetaInsightsService.fetchCampaignInsights(token, campaignId, options);
  }

  /**
   * Fetch insights for an ad account
   */
  public static async fetchAccountInsights(token: string, accountId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return MetaInsightsService.fetchAccountInsights(token, accountId, options);
  }

  /**
   * Fetch insights with demographic breakdowns
   */
  public static async fetchDemographicInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return MetaInsightsService.fetchDemographicInsights(token, objectId, options);
  }

  /**
   * Fetch insights with geographic breakdowns
   */
  public static async fetchGeographicInsights(token: string, objectId: string, options: InsightFilterOptions = {}): Promise<InsightsResponse> {
    return MetaInsightsService.fetchGeographicInsights(token, objectId, options);
  }
}
