
import { CampaignFetchLog } from './types/campaignLogTypes';
import LogStorage from './services/logStorage';
import LogEventEmitter from './services/logEventEmitter';
import { parseMetaError } from './services/parsers/errorParser';
import ResponseParser from './services/responseParser';

class CampaignFetchLogger {
  static logAttempt(accountId: string): void {
    if (!accountId) {
      console.error('[CAMPAIGN FETCH] ❌ Missing account ID');
      return;
    }

    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
    
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
        localStorage.setItem('campaign_fetch_attempts', (attempts + 1).toString());
        console.log(`[CAMPAIGN FETCH] 🔢 Updated fetch attempts: ${attempts} → ${attempts + 1}`);
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
      const responseData = await response.clone().json().catch(() => null);
      console.log('[CAMPAIGN FETCH] Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });

      const log = await ResponseParser.parseResponse(response, accountId, queryParams);
      LogStorage.addLog(log as CampaignFetchLog);
      LogEventEmitter.emitLogUpdate(log as CampaignFetchLog);
    } catch (err) {
      console.error('[CAMPAIGN FETCH] Error in logResponse:', err);
    }
  }

  static logError(error: any, accountId: string): void {
    console.error('[CAMPAIGN FETCH] Error:', {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      response: error?.response?.data,
      raw: error
    });
    
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      error: parseMetaError(error)
    };

    localStorage.setItem('last_campaign_fetch_error', JSON.stringify(log.error));
    console.log('[CAMPAIGN FETCH] Error details stored in localStorage');

    LogStorage.addLog(log);
    LogEventEmitter.emitLogUpdate(log);
  }

  static getLogs(): CampaignFetchLog[] {
    return LogStorage.getLogs();
  }
}

export default CampaignFetchLogger;
