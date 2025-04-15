
interface CampaignFetchLog {
  timestamp: string;
  accountId: string;
  status?: number;
  statusText?: string;
  responseBody?: string;
  parsedJson?: any;
  error?: string;
}

class CampaignFetchLogger {
  private static logs: CampaignFetchLog[] = [];
  private static maxLogs = 10;

  static logAttempt(accountId: string) {
    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
  }

  static async logResponse(response: Response, accountId: string) {
    try {
      const responseText = await response.clone().text();
      console.log('[CAMPAIGN FETCH] 📦 Raw Response:', response.status, response.statusText);
      console.log('[CAMPAIGN FETCH] 📄 Response Body:', responseText);

      let parsedJson;
      try {
        parsedJson = JSON.parse(responseText);
        console.log('[CAMPAIGN FETCH] ✅ Parsed JSON:', parsedJson);
      } catch (err) {
        console.error('[CAMPAIGN FETCH] ❌ Failed to parse JSON:', err);
      }

      const log: CampaignFetchLog = {
        timestamp: new Date().toISOString(),
        accountId,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        parsedJson
      };

      this.logs.unshift(log);
      if (this.logs.length > this.maxLogs) {
        this.logs.pop();
      }

      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('campaign-fetch-log', { 
          detail: log 
        }));
      }

    } catch (error) {
      console.error('[CAMPAIGN FETCH] ❌ Error logging response:', error);
    }
  }

  static logError(error: any, accountId: string) {
    // Handle direct data object (for non-Response objects)
    let log: CampaignFetchLog;
    
    if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
      // This is likely a data object, not an actual error
      log = {
        timestamp: new Date().toISOString(),
        accountId,
        status: error.status,
        statusText: error.statusText,
        responseBody: error.responseBody,
        parsedJson: error.parsedJson
      };
      
      console.log('[CAMPAIGN FETCH] 📦 Data:', error.status, error.statusText);
      if (error.responseBody) {
        console.log('[CAMPAIGN FETCH] 📄 Data Body:', error.responseBody);
      }
      if (error.parsedJson) {
        console.log('[CAMPAIGN FETCH] ✅ Parsed Data:', error.parsedJson);
      }
    } else {
      // This is an actual error
      log = {
        timestamp: new Date().toISOString(),
        accountId,
        error: error?.message || String(error)
      };
      console.error('[CAMPAIGN FETCH] ❌ Error:', error);
    }

    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('campaign-fetch-log', { 
        detail: log 
      }));
    }
  }

  static getLogs() {
    return this.logs;
  }
}

export default CampaignFetchLogger;
