
import { BaseMockService } from './BaseMockService';

export class MetaInsightsMockService extends BaseMockService {
  public static async fetchInsights(): Promise<any> {
    return {};
  }
  
  public static async fetchCampaignInsights(): Promise<any> {
    return {};
  }
  
  public static async fetchAccountInsights(): Promise<any> {
    return {};
  }
  
  public static async fetchDemographicInsights(): Promise<any> {
    return {};
  }
  
  public static async fetchGeographicInsights(): Promise<any> {
    return {};
  }
}
