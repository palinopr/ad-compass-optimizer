
export class FunnelAccountService {
  static getFormattedAdAccountId(): string | null {
    let selectedAdAccount = null;
    try {
      if (typeof localStorage !== 'undefined') {
        selectedAdAccount = localStorage.getItem('selected_ad_account');
      }
    } catch (e) {
      console.error("Error accessing localStorage in FunnelViewContainer:", e);
    }
    
    if (!selectedAdAccount) return null;
    
    return selectedAdAccount.startsWith('act_') 
      ? selectedAdAccount
      : `act_${selectedAdAccount}`;
  }
}
