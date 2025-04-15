
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
      // Create base log entry
      const log: CampaignFetchLog = {
        timestamp: new Date().toISOString(),
        accountId,
        status: response.status,
        statusText: response.statusText,
        queryParams
      };
      
      // Add response headers
      try {
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        log.headers = headers;
        
        // Store headers in localStorage for debugging
        localStorage.setItem('last_campaign_fetch_headers', JSON.stringify(headers));
        console.log('[CAMPAIGN FETCH] 📋 Response headers captured and stored');
      } catch (err) {
        console.error('[CAMPAIGN FETCH] ❌ Error extracting headers:', err);
      }
      
      // Try to parse the response body
      try {
        // Clone the response so we can read the body
        const clonedResponse = response.clone();
        const bodyText = await clonedResponse.text();
        log.responseBody = bodyText.substring(0, 1000); // Limit size for storage
        
        console.log('[CAMPAIGN FETCH] 📥 Raw response body:', bodyText.substring(0, 500) + '...');
        
        // Try to parse as JSON
        try {
          const json = JSON.parse(bodyText);
          log.parsedJson = json;
          
          // Extract Meta API specific error details if present
          if (json.error) {
            log.errorDetails = {
              status: response.status,
              statusText: response.statusText,
              message: json.error.message,
              code: json.error.code,
              type: json.error.type,
              subcode: json.error.error_subcode,
              fbTraceId: json.error.fbtrace_id
            };
            
            // Store error details in localStorage
            localStorage.setItem('last_campaign_fetch_error', JSON.stringify(log.errorDetails));
            console.log('[CAMPAIGN FETCH] ❌ API error detected and logged:', log.errorDetails);
          }
          
          // Extract campaign previews for debugging
          if (json.data && Array.isArray(json.data)) {
            console.log(`[CAMPAIGN FETCH] ✅ Found ${json.data.length} campaigns in response`);
            
            const parsedResult = await ResponseParser.parseResponse(response, accountId, queryParams);
            if (parsedResult && parsedResult.campaignPreviews) {
              log.campaignPreviews = parsedResult.campaignPreviews;
              console.log('[CAMPAIGN FETCH] 📊 Campaign previews extracted:', log.campaignPreviews.length);
            }
          }
        } catch (jsonErr) {
          console.warn('[CAMPAIGN FETCH] ⚠️ Response not valid JSON:', jsonErr);
        }
      } catch (bodyErr) {
        console.error('[CAMPAIGN FETCH] ❌ Error reading response body:', bodyErr);
      }

      LogStorage.addLog(log);
      LogEventEmitter.emitLogUpdate(log);
      
      // If there's an error status, log it clearly
      if (!response.ok) {
        console.error(
          `[CAMPAIGN FETCH] ❌ Error response: ${response.status} ${response.statusText}`,
          log.errorDetails || {}
        );
      }
    } catch (error) {
      console.error('[CAMPAIGN FETCH] ❌ Error logging response:', error);
      
      // Create a basic error log
      const errorLog: CampaignFetchLog = {
        timestamp: new Date().toISOString(),
        accountId,
        error: error instanceof Error ? error.message : String(error)
      };
      
      LogStorage.addLog(errorLog);
      LogEventEmitter.emitLogUpdate(errorLog);
    }
  }

  static logError(error: any, accountId: string): void {
    console.error('[CAMPAIGN FETCH] ❌ Error:', error);
    
    // Create detailed error log
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      error: error?.message || String(error),
      errorDetails: {
        status: error?.status || error?.code || 'unknown',
        statusText: error?.statusText,
        message: error?.message,
        code: error?.code || error?.details?.error?.code,
        type: error?.type || error?.details?.error?.type,
        subcode: error?.error_subcode,
        timestamp: new Date().toISOString(),
        fbTraceId: error?.fbtraceId || error?.error?.fbtrace_id
      }
    };

    // Store error details in localStorage
    localStorage.setItem('last_campaign_fetch_error', JSON.stringify(log.errorDetails));
    console.log('[CAMPAIGN FETCH] ❌ Error details stored in localStorage');

    LogStorage.addLog(log);
    LogEventEmitter.emitLogUpdate(log);
  }

  static getLogs(): CampaignFetchLog[] {
    return LogStorage.getLogs();
  }
}

export default CampaignFetchLogger;
