
export class AccountValidator {
  static validate(adAccountId: string): boolean {
    if (!adAccountId) {
      throw new Error('Ad Account ID is required');
    }
    
    // Validate ad account ID format
    if (!/^act_\d+$/.test(adAccountId)) {
      console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${adAccountId}`);
      throw new Error(`Invalid ad account ID format: ${adAccountId}`);
    }
    
    return true;
  }

  static format(adAccountId: string): string {
    return adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  }
}
