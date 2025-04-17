
import { RequestSignatureGenerator } from './signature/RequestSignatureGenerator';
import { DuplicateStorage } from './storage/DuplicateStorage';
import { RequestTracker } from './tracking/RequestTracker';
import { DatePresetValidator } from './validation/DatePresetValidator';

export class DuplicateRequestChecker {
  static isDuplicate(campaignId: string, datePreset: string): boolean {
    console.log(`[INSIGHTS] Checking for duplicate request: campaign=${campaignId}, datePreset=${datePreset}`);
    
    if (DatePresetValidator.isProblematicDatePreset(datePreset)) {
      console.log(`[INSIGHTS] Automatically blocking request with problematic date preset "${datePreset}" for campaign=${campaignId}`);
      DuplicateStorage.storeBlocked28d(campaignId, datePreset);
      return true;
    }
  
    const requestKey = `${campaignId}_${datePreset}`;
    if (RequestTracker.isProcessed(requestKey)) {
      console.log(`[INSIGHTS] Skipping duplicate request: campaign=${campaignId}, date_preset=${datePreset}`);
      return true;
    }
    
    const objectFailureKey = `object-${campaignId}-failed`;
    const nonexistentKey = `object-${campaignId}-nonexistent`;
    if (RequestTracker.isPermanentlyFailed(objectFailureKey) || RequestTracker.isPermanentlyFailed(nonexistentKey)) {
      console.log(`[INSIGHTS] 🚫 Skipped permanently blocked campaign: ${campaignId}`);
      return true;
    }
    
    RequestTracker.markProcessed(requestKey);
    RequestTracker.cleanupOldRequests();
    return false;
  }

  static isPermanentlyFailed(requestSignature: string): boolean {
    if (DatePresetValidator.isProblematicDatePreset(requestSignature)) {
      console.log(`[INSIGHTS] Auto-blocking request with problematic date preset signature: ${requestSignature}`);
      this.markAsPermanentlyFailed(requestSignature);
      DuplicateStorage.storeSignatureBlock(requestSignature);
      return true;
    }
    
    return RequestTracker.isPermanentlyFailed(requestSignature);
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] ✅ Permanently blocking request: ${requestSignature}`);
    RequestTracker.markPermanentlyFailed(requestSignature);
    DuplicateStorage.storePermanentFailure(requestSignature);
  }

  static reset(): void {
    RequestTracker.reset();
    DuplicateStorage.clearStorage();
    console.log('[INSIGHTS] Reset all duplicate checker state and cleared localStorage');
  }

  static generateRequestSignature(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    return RequestSignatureGenerator.generate(objectId, endpoint, options);
  }
}
