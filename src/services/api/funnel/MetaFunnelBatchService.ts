
import { BatchRequest } from '../batch/MetaBatchService';

export class MetaFunnelBatchService {
  public static buildBatchRequests(adAccountId: string): BatchRequest[] {
    // Ensure the account ID has the proper format
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    
    console.log('[META FUNNEL] Building batch requests for account:', formattedId);
    
    // These must match exactly the fields we're requesting in the direct API call
    // IMPORTANT: Using fields parameter with essential fields to prevent empty objects
    const campaignsUrl = `/${formattedId}/campaigns?fields=id,name,status,effective_status,start_time,stop_time,daily_budget,lifetime_budget,objective,created_time,updated_time,insights.date_preset(maximum){impressions,clicks,spend,actions,cost_per_action_type,website_purchase_roas}`;
    console.log('[META FUNNEL] Campaigns URL:', campaignsUrl);
    
    return [
      {
        method: 'GET',
        relative_url: campaignsUrl,
        name: 'campaigns'
      },
      {
        method: 'GET',
        relative_url: `/${formattedId}/adsets?fields=id,name,campaign_id,status,effective_status`,
        name: 'adsets'
      },
      {
        method: 'GET',
        relative_url: `/${formattedId}/ads?fields=id,name,adset_id,status,effective_status`,
        name: 'ads'
      }
    ];
  }
}
