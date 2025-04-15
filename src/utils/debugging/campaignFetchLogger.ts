
interface CampaignFetchLog {
  timestamp: string;
  accountId: string;
  status?: number;
  statusText?: string;
  responseBody?: string;
  parsedJson?: any;
  error?: string;
  insightsData?: boolean;
  datePreset?: string;
  queryParams?: string;
}

class CampaignFetchLogger {
  private static logs: CampaignFetchLog[] = [];
  private static maxLogs = 10;

  static logAttempt(accountId: string) {
    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
    
    // Dispatch event to notify UI components
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('campaign-fetch-attempt', { 
        detail: { accountId } 
      });
      window.dispatchEvent(event);
    }
  }

  static async logResponse(response: Response, accountId: string, queryParams?: string) {
    try {
      const responseText = await response.clone().text();
      console.log('[CAMPAIGN FETCH] 📦 Raw Response:', response.status, response.statusText);
      console.log('[CAMPAIGN FETCH] 📄 Response Body:', responseText);
      console.log('[CAMPAIGN FETCH] 🔍 Query Parameters:', queryParams);

      let parsedJson;
      let hasInsights = false;
      let datePreset = '';
      
      try {
        parsedJson = JSON.parse(responseText);
        console.log('[CAMPAIGN FETCH] ✅ Parsed JSON:', parsedJson);
        
        // Extract date_preset from query parameters
        if (queryParams) {
          const datePresetMatch = queryParams.match(/date_preset=([^&]+)/);
          if (datePresetMatch) {
            datePreset = datePresetMatch[1];
          }
        }
        
        // Check if any campaigns have insights data
        if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
          const campaignsWithInsights = parsedJson.data.filter(
            (campaign: any) => campaign.insights && campaign.insights.data && campaign.insights.data.length > 0
          ).length;
          
          hasInsights = campaignsWithInsights > 0;
          console.log(`[CAMPAIGN FETCH] 📊 Campaigns with insights data: ${campaignsWithInsights}/${parsedJson.data.length}`);
          
          if (campaignsWithInsights === 0) {
            console.warn('[CAMPAIGN FETCH] ⚠️ No insights data found in response');
          }
          
          // Log first campaign insights for debugging
          if (hasInsights && parsedJson.data[0].insights) {
            console.log('[CAMPAIGN FETCH] 📊 Sample insights:', parsedJson.data[0].insights.data[0]);
          }
        }
      } catch (err) {
        console.error('[CAMPAIGN FETCH] ❌ Failed to parse JSON:', err);
      }

      const log: CampaignFetchLog = {
        timestamp: new Date().toISOString(),
        accountId,
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        parsedJson,
        insightsData: hasInsights,
        datePreset,
        queryParams
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
