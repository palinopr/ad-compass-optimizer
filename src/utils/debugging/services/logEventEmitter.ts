
import { CampaignFetchLog } from '../types/campaignLogTypes';

class LogEventEmitter {
  static emitFetchAttempt(accountId: string): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('campaign-fetch-attempt', { 
        detail: { accountId, timestamp: new Date().toISOString() } 
      });
      window.dispatchEvent(event);
      
      // Also update the fetch attempts counter in localStorage
      try {
        const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
        localStorage.setItem('campaign_fetch_attempts', (attempts + 1).toString());
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error updating fetch attempts:', e);
      }
    }
  }

  static emitLogUpdate(log: CampaignFetchLog): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campaign-fetch-log', { 
        detail: log 
      }));
    }
  }
}

export default LogEventEmitter;
