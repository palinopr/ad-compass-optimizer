
import { DuplicateStorage } from '../storage/DuplicateStorage';
import { DatePresetValidator } from '../validation/DatePresetValidator';

export class RequestSignatureService {
  static validateRequest(campaignId: string, datePreset: string): boolean {
    if (DatePresetValidator.isProblematicDatePreset(datePreset)) {
      console.log(`[INSIGHTS] Automatically blocking request with problematic date preset "${datePreset}" for campaign=${campaignId}`);
      DuplicateStorage.storeBlocked28d(campaignId, datePreset);
      return false;
    }
    return true;
  }

  static generate(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    return `${endpoint}:${objectId}:${JSON.stringify(options)}`;
  }
}
