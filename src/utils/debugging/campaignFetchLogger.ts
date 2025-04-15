
import { CampaignFetchLog } from './types/campaignLogTypes';
import LogStorage from './services/logStorage';
import LogEventEmitter from './services/logEventEmitter';
import ResponseParser from './services/responseParser';

class CampaignFetchLogger {
  static logAttempt(accountId: string): void {
    if (!accountId) {
      console.error('[CAMPAIGN FETCH] ❌ Missing account ID');
      return;
    }

    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
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
      const parsedLog = await ResponseParser.parseResponse(response, accountId, queryParams);
      LogStorage.addLog(parsedLog as CampaignFetchLog);
      LogEventEmitter.emitLogUpdate(parsedLog as CampaignFetchLog);
    } catch (error) {
      console.error('[CAMPAIGN FETCH] ❌ Error logging response:', error);
    }
  }

  static logError(error: any, accountId: string): void {
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      error: error?.message || String(error)
    };

    LogStorage.addLog(log);
    LogEventEmitter.emitLogUpdate(log);
    console.error('[CAMPAIGN FETCH] ❌ Error:', error);
  }

  static getLogs(): CampaignFetchLog[] {
    return LogStorage.getLogs();
  }
}

export default CampaignFetchLogger;
