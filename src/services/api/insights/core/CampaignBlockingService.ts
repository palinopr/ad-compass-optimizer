
/**
 * Service for handling blocked campaign management
 */
export class CampaignBlockingService {
  private static readonly BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';

  /**
   * Check if a campaign is blocked from insights fetches
   */
  public static isCampaignBlocked(campaignId: string): boolean {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      return blockedCampaigns.includes(campaignId);
    } catch (e) {
      console.error('[CAMPAIGN BLOCKING] Error checking if campaign is blocked:', e);
      return false;
    }
  }

  /**
   * Add a campaign to the blocked list
   */
  public static blockCampaign(campaignId: string): void {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      
      if (!blockedCampaigns.includes(campaignId)) {
        blockedCampaigns.push(campaignId);
        localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        
        console.log(`[CAMPAIGN BLOCKING] Campaign ${campaignId} added to blocked list`);
        
        // Also update meta stats for monitoring
        const blockedStats = JSON.parse(localStorage.getItem('insights_blocked_stats') || '{}');
        blockedStats[campaignId] = {
          timestamp: new Date().toISOString(),
          reason: '400_error'
        };
        localStorage.setItem('insights_blocked_stats', JSON.stringify(blockedStats));
      }
    } catch (e) {
      console.error('[CAMPAIGN BLOCKING] Error blocking campaign:', e);
    }
  }

  /**
   * Remove a campaign from the blocked list
   */
  public static unblockCampaign(campaignId: string): void {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      const updatedList = blockedCampaigns.filter((id: string) => id !== campaignId);
      localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify(updatedList));
      
      console.log(`[CAMPAIGN BLOCKING] Campaign ${campaignId} removed from blocked list`);
    } catch (e) {
      console.error('[CAMPAIGN BLOCKING] Error unblocking campaign:', e);
    }
  }

  /**
   * Get all blocked campaigns
   */
  public static getBlockedCampaigns(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
    } catch (e) {
      console.error('[CAMPAIGN BLOCKING] Error getting blocked campaigns:', e);
      return [];
    }
  }

  /**
   * Create a standardized error object for blocked campaigns
   */
  public static createBlockedError(campaignId: string): Error {
    const error = new Error(`Campaign ${campaignId} is blocked from insights fetching due to previous 400 errors`);
    (error as any).status = 400;
    (error as any).blocked = true;
    return error;
  }
}
