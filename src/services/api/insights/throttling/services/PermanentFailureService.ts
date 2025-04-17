
import { RequestTracker } from '../tracking/RequestTracker';
import { DuplicateStorage } from '../storage/DuplicateStorage';
import { DatePresetValidator } from '../validation/DatePresetValidator';

export class PermanentFailureService {
  static check(requestSignature: string): boolean {
    if (DatePresetValidator.isProblematicDatePreset(requestSignature)) {
      console.log(`[INSIGHTS] Auto-blocking request with problematic date preset signature: ${requestSignature}`);
      this.markFailed(requestSignature);
      DuplicateStorage.storeSignatureBlock(requestSignature);
      return true;
    }
    
    return RequestTracker.isPermanentlyFailed(requestSignature);
  }

  static markFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] ✅ Permanently blocking request: ${requestSignature}`);
    RequestTracker.markPermanentlyFailed(requestSignature);
    DuplicateStorage.storePermanentFailure(requestSignature);
  }
}
