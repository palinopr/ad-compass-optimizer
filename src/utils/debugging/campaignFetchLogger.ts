
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
  requestUrl?: string;
  campaignPreviews?: Array<{
    id: string;
    name: string;
    status: string;
    spend: string;
    results: string;
  }>;
}

class CampaignFetchLogger {
  private static logs: CampaignFetchLog[] = [];
  private static maxLogs = 10;

  static logAttempt(accountId: string) {
    if (!accountId) {
      console.error('[CAMPAIGN FETCH] ❌ Missing account ID');
      return;
    }

    console.log('[CAMPAIGN FETCH] 🔄 Fetching campaigns for:', accountId);
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('campaign-fetch-attempt', { 
        detail: { accountId } 
      });
      window.dispatchEvent(event);
    }
  }
  
  static logRequest(accountId: string, requestUrl: string) {
    console.log('[CAMPAIGN FETCH] 🚀 Request URL:', requestUrl);
    
    const log: CampaignFetchLog = {
      timestamp: new Date().toISOString(),
      accountId,
      requestUrl
    };
    
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

  static async logResponse(response: Response, accountId: string, queryParams?: string) {
    try {
      const responseText = await response.clone().text();
      console.log('[CAMPAIGN FETCH] 📦 Response:', response.status, response.statusText);
      
      let parsedJson;
      let hasInsights = false;
      let datePreset = '';
      let campaignPreviews = [];
      
      try {
        parsedJson = JSON.parse(responseText);
        
        if (queryParams) {
          const datePresetMatch = queryParams.match(/date_preset=([^&]+)/);
          if (datePresetMatch) {
            datePreset = datePresetMatch[1];
          }
        }
        
        // Extract campaign previews for logging
        if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
          campaignPreviews = parsedJson.data.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            spend: campaign.spend || '$0.00',
            results: campaign.results || '0'
          }));

          // Log campaign previews for debugging
          console.log('[CAMPAIGN FETCH] 📊 Campaign Previews:', campaignPreviews);
          
          const campaignsWithInsights = parsedJson.data.filter(
            (campaign: any) => campaign.insights && campaign.insights.data && campaign.insights.data.length > 0
          ).length;
          
          hasInsights = campaignsWithInsights > 0;
          
          if (campaignsWithInsights === 0) {
            console.warn('[CAMPAIGN FETCH] ⚠️ No insights data found in response');
          }
          
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
        queryParams,
        campaignPreviews
      };

      // Update existing request log or add new one
      const existingLogIndex = this.logs.findIndex(l => 
        l.accountId === accountId && l.timestamp > new Date(Date.now() - 5000).toISOString()
      );
      
      if (existingLogIndex >= 0) {
        this.logs[existingLogIndex] = { ...this.logs[existingLogIndex], ...log };
      } else {
        this.logs.unshift(log);
        if (this.logs.length > this.maxLogs) {
          this.logs.pop();
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('campaign-fetch-log', { 
          detail: existingLogIndex >= 0 ? this.logs[existingLogIndex] : log 
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
