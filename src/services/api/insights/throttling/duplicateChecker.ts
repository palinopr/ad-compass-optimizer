
import { RequestSignatureService } from './services/RequestSignatureService';
import { PermanentFailureService } from './services/PermanentFailureService';
import { RequestTracker } from './tracking/RequestTracker';
import { DuplicateStorage } from './storage/DuplicateStorage';

export class DuplicateRequestChecker {
  static isDuplicate(campaignId: string, datePreset: string): boolean {
    console.log(`[INSIGHTS] Checking for duplicate request: campaign=${campaignId}, datePreset=${datePreset}`);
    
    if (!RequestSignatureService.validateRequest(campaignId, datePreset)) {
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
    return PermanentFailureService.check(requestSignature);
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    PermanentFailureService.markFailed(requestSignature);
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
    return RequestSignatureService.generate(objectId, endpoint, options);
  }
}
