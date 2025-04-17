
/**
 * Handles localStorage operations for duplicate request checking
 */
export class DuplicateStorage {
  private static readonly BLOCKED_28D_KEY = 'insights_blocked_last28d';
  private static readonly SIGNATURE_BLOCKS_KEY = 'insights_signature_blocks';
  private static readonly PERMANENT_FAILURES_KEY = 'insights_permanent_failures';
  private static readonly DATE_REPLACEMENTS_KEY = 'signature_date_preset_replacements';

  static storeBlocked28d(campaignId: string, datePreset: string): void {
    try {
      const blockedLast28d = JSON.parse(localStorage.getItem(this.BLOCKED_28D_KEY) || '[]');
      blockedLast28d.push({
        timestamp: new Date().toISOString(),
        campaignId,
        datePreset,
        location: 'isDuplicate-method'
      });
      localStorage.setItem(this.BLOCKED_28D_KEY, JSON.stringify(blockedLast28d.slice(-30)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  static storePermanentFailure(signature: string): void {
    try {
      const allMarked = JSON.parse(localStorage.getItem(this.PERMANENT_FAILURES_KEY) || '[]');
      allMarked.push({
        timestamp: new Date().toISOString(),
        signature
      });
      localStorage.setItem(this.PERMANENT_FAILURES_KEY, JSON.stringify(allMarked.slice(-50)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  static storeSignatureBlock(signature: string): void {
    try {
      const blockedSignatures = JSON.parse(localStorage.getItem(this.SIGNATURE_BLOCKS_KEY) || '[]');
      blockedSignatures.push({
        timestamp: new Date().toISOString(),
        signature,
        reason: 'contains_28d_pattern',
        location: 'isPermanentlyFailed-method'
      });
      localStorage.setItem(this.SIGNATURE_BLOCKS_KEY, JSON.stringify(blockedSignatures.slice(-30)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  static storeDatePresetReplacement(objectId: string, endpoint: string, original: string): void {
    try {
      const replacements = JSON.parse(localStorage.getItem(this.DATE_REPLACEMENTS_KEY) || '[]');
      replacements.push({
        timestamp: new Date().toISOString(),
        objectId,
        endpoint,
        original,
        replacedWith: 'maximum'
      });
      localStorage.setItem(this.DATE_REPLACEMENTS_KEY, JSON.stringify(replacements.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  static clearStorage(): void {
    localStorage.removeItem(this.BLOCKED_28D_KEY);
    localStorage.removeItem(this.SIGNATURE_BLOCKS_KEY);
    localStorage.removeItem(this.PERMANENT_FAILURES_KEY);
    localStorage.removeItem(this.DATE_REPLACEMENTS_KEY);
  }
}
