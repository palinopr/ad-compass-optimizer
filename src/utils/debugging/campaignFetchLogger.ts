import { CampaignFetchLog } from './types/campaignLogTypes';
import LogStorage from './services/logStorage';
import LogEventEmitter from './services/logEventEmitter';
import { parseMetaError } from './services/parsers/errorParser';

class CampaignFetchLogger {
  static logAttempt(accountId: string): void {
    if (!accountId) {
      console.error('[CAMPAIGN FETCH] ❌ Missing account ID');
      return;
    }

    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
    
    // Increment fetch attempts counter
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
        const newAttempts = attempts + 1;
        localStorage.setItem('campaign_fetch_attempts', newAttempts.toString());
        console.log(`[CAMPAIGN FETCH] 🔢 Updated fetch attempts: ${attempts} → ${newAttempts}`);
      }
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error updating fetch attempts:', e);
    }
    
    LogEventEmitter.emitFetchAttempt(accountId);
  }
  
  static logRequest(accountId: string, requestUrl: string): void {
    console.log('[CAMPAIGN FETCH] 🚀 Request URL:', requestUrl);
    
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      requestUrl
    };
    
    LogStorage.addLog(log);
    LogEventEmitter.emitLogUpdate(log);
  }

  static async logResponse(response: Response, accountId: string, queryParams?: string): Promise<void> {
    try {
      const log: CampaignFetchLog = {
        timestamp: new Date().toISOString(),
        accountId,
        status: response.status,
        statusText: response.statusText,
        queryParams
      };

      if (!response.ok) {
        const errorData = await response.clone().json();
        log.error = parseMetaError(errorData);
        
        // Store error details for debugging panel
        try {
          localStorage.setItem('last_meta_error', JSON.stringify(log.error));
        } catch (e) {
          console.error('Error storing error details:', e);
        }
      } else {
        try {
          const data = await response.clone().json();
          log.campaignPreviews = data.data?.slice(0, 3).map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            spend: campaign.insights?.spend || '$0.00',
            results: campaign.insights?.actions?.find((a: any) => a.action_type === 'purchase')?.value || '0'
          }));
        } catch (e) {
          console.error('Error parsing success response:', e);
        }
      }

      LogStorage.addLog(log);
      LogEventEmitter.emitLogUpdate(log);
    } catch (err) {
      console.error('Error in logResponse:', err);
    }
  }

  static logError(error: any, accountId: string): void {
    console.error('[CAMPAIGN FETCH] ❌ Error:', error);
    
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      error: parseMetaError(error)
    };

    // Store error details in localStorage
    localStorage.setItem('last_campaign_fetch_error', JSON.stringify(log.error));
    console.log('[CAMPAIGN FETCH] ❌ Error details stored in localStorage');

    LogStorage.addLog(log);
    LogEventEmitter.emitLogUpdate(log);
  }

  static getLogs(): CampaignFetchLog[] {
    return LogStorage.getLogs();
  }
}

export default CampaignFetchLogger;
