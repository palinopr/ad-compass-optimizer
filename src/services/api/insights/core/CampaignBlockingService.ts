
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
      
      if (blockedCampaigns.includes(campaignId)) {
        console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
        return true;
      }

      // Also check failed signatures
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      const objectFailSignature = `object-${campaignId}-failed`;
      
      if (failedSignatures.includes(objectFailSignature)) {
        console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (in signatures)`);
        // Ensure it's also in the main blocklist for consistency
        this.blockCampaign(campaignId);
        return true;
      }
      
      // Additional check in 400 failures log
      try {
        const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
        if (failures400.some((f: any) => f.campaignId === campaignId)) {
          console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (in 400 failures log)`);
          // Ensure it's in the main blocklist for consistency
          this.blockCampaign(campaignId);
          return true;
        }
      } catch (e) {
        // Ignore errors in this additional check
      }
    } catch (e) {
      console.error('[INSIGHTS] Error checking if campaign is blocked:', e);
    }
    
    return false;
  }

  /**
   * Add a campaign ID to the blocked campaigns list
   */
  public static blockCampaign(campaignId: string): void {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      if (!blockedCampaigns.includes(campaignId)) {
        blockedCampaigns.push(campaignId);
        localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        console.log(`[INSIGHTS] ✅ Permanently blocked campaign: ${campaignId}`);
      }
      
      // Also add to failed signatures for cross-checking
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      const objectFailSignature = `object-${campaignId}-failed`;
      if (!failedSignatures.includes(objectFailSignature)) {
        failedSignatures.push(objectFailSignature);
        localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
        console.log(`[INSIGHTS] ✅ Added to failed signatures: ${objectFailSignature}`);
      }
      
      // Also add to 400 failures log for diagnostic purposes
      try {
        const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
        const entry = {
          timestamp: new Date().toISOString(),
          campaignId,
          error: 'Blocked after 400 error'
        };
        
        // Only add if not already present
        if (!failures400.some((f: any) => f.campaignId === campaignId)) {
          failures400.push(entry);
          localStorage.setItem('insights_400_failures', JSON.stringify(failures400.slice(-30)));
        }
      } catch (e) {
        console.error('[INSIGHTS] Error adding to 400 failures log:', e);
      }
    } catch (e) {
      console.error('[INSIGHTS] Error marking campaign as blocked:', e);
      
      // Fallback direct write attempt if parsing fails
      try {
        localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify([campaignId]));
      } catch (innerError) {
        console.error('[INSIGHTS] Critical error storing blocked campaigns:', innerError);
      }
    }
  }

  /**
   * Create an error object for a blocked campaign
   */
  public static createBlockedError(objectId: string): Error {
    const error = new Error(`Campaign ${objectId} is permanently blocked due to previous 400 error`);
    (error as any).status = 400;
    (error as any).skipped = true;
    return error;
  }
}
