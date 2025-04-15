
import { CampaignFetchLog } from '../types/campaignLogTypes';

class LogEventEmitter {
  static emitFetchAttempt(accountId: string): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('campaign-fetch-attempt', { 
        detail: { accountId } 
      });
      window.dispatchEvent(event);
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
