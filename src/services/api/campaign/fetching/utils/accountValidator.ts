
export class AccountValidator {
  static validate(adAccountId: string): boolean {
    if (!adAccountId) {
      throw new Error('Ad Account ID is required');
    }
    
    // Normalize the account ID first
    const normalizedId = this.format(adAccountId);
    
    // Validate ad account ID format
    if (!/^act_\d+$/.test(normalizedId)) {
      console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${normalizedId}`);
      throw new Error(`Invalid ad account ID format: ${normalizedId}`);
    }
    
    return true;
  }

  static format(adAccountId: string): string {
    // Strip any existing act_ prefix to avoid duplicates
    const cleanId = adAccountId.replace(/^act_/, '');
    return `act_${cleanId}`;
  }
}
