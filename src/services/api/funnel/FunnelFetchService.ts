
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaFunnelService } from '../MetaFunnelService';
import { FunnelData } from '../types/funnelTypes';
import { FunnelAccountService } from './FunnelAccountService';
import { FunnelDateService } from './FunnelDateService';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { toast } from '@/hooks/use-toast';

interface FetchResponse {
  data: FunnelData;
  error: string | null;
  accountId: string | null;
}

export class FunnelFetchService {
  static async fetchFunnelData(
    datePreset: string,
    buildVersion: string,
    lastFetchedAdAccount: string | null
  ): Promise<FetchResponse> {
    let token: string | null = null;
    const formattedAccount = FunnelAccountService.getFormattedAdAccountId();
    
    if (typeof window !== 'undefined') {
      token = metaAuthService.getAccessToken();
    }
    
    console.log('[FUNNEL] Fetch attempt with token:', token ? 'Valid token' : 'No token');
    console.log('[FUNNEL] Selected ad account:', formattedAccount);
    
    if (!token) {
      return {
        data: { campaigns: [], adsets: [], ads: [] },
        error: 'Missing access token',
        accountId: formattedAccount
      };
    }

    if (!formattedAccount) {
      return {
        data: { campaigns: [], adsets: [], ads: [] },
        error: 'No ad account selected',
        accountId: null
      };
    }
    
    const requestDetails = {
      endpoint: `${formattedAccount}/campaigns`,
      accountId: formattedAccount,
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString(),
      datePreset: datePreset
    };
    
    if (formattedAccount === lastFetchedAdAccount && requestDetails) {
      return {
        data: { campaigns: [], adsets: [], ads: [] },
        error: null,
        accountId: formattedAccount
      };
    }

    try {
      console.log('[FUNNEL] Fetching funnel data for account:', formattedAccount);
      
      // Important: Log the exact API URL format that will be used with the correct datePreset
      const campaignsUrl = `https://graph.facebook.com/v17.0/${formattedAccount}/campaigns?fields=id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(${datePreset}){impressions,clicks,spend,actions,cost_per_action_type}&access_token=[REDACTED]`;
      console.log('[FUNNEL] API URL format:', campaignsUrl);
      
      const data = await MetaFunnelService.fetchFunnelData(token, formattedAccount);
      
      console.log(`[FUNNEL] Received funnel data with ${data.campaigns.length} campaigns`);
      if (data.campaigns.length > 0) {
        console.log('[FUNNEL] First campaign sample:', data.campaigns[0]);
      } else {
        console.warn('[FUNNEL] No campaigns found in response');
      }
      
      if (data.campaigns.length > 0) {
        console.log("[FUNNEL] Ensuring campaign state is in sync with funnel data");
        
        setTimeout(() => {
          triggerCampaignRefresh(true);
        }, 500);
      } else {
        console.warn('[FUNNEL] No campaigns received from API');
      }
      
      return {
        data,
        error: null,
        accountId: formattedAccount
      };
    } catch (err: any) {
      console.error('[FUNNEL] Error fetching funnel data:', err);
      
      if (err?.error) {
        console.error('[FUNNEL] API Error details:', {
          message: err.error.message,
          code: err.error.code,
          type: err.error.type,
          subcode: err.error.error_subcode
        });
      }
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err?.error?.message || 'Failed to fetch funnel data');
                     
      if (err?.error) {
        console.error('[FUNNEL] Error details:', {
          code: err.error.code,
          type: err.error.type,
          message: err.error.message
        });
      }
      
      return {
        data: { campaigns: [], adsets: [], ads: [] },
        error: errorMessage,
        accountId: formattedAccount
      };
    }
  }

  static triggerManualRefresh(datePreset: string, buildVersion: string): void {
    console.log('[FUNNEL] Manually triggering refresh...');
    triggerCampaignRefresh(true);
    
    toast({
      title: "Refreshing campaigns",
      description: `Fetching latest data from Meta with ${datePreset} preset (${buildVersion})...`
    });
  }
}
