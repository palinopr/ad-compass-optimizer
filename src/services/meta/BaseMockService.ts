
import { MetaCampaign } from '../api/MetaCampaignService';

export class BaseMockService {
  public static isMockMode(): boolean {
    return false;
  }
  
  public static checkMockMode(): boolean {
    return false;
  }
  
  public static syncMockCampaignsToState(campaigns: MetaCampaign[]): void {
    // This is just a stub implementation to satisfy TypeScript
    console.log('Mock campaigns sync called, but mock mode is disabled');
  }
}
