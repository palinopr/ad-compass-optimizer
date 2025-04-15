
import { BatchRequest } from '../batch/MetaBatchService';

export class MetaFunnelBatchService {
  public static buildBatchRequests(adAccountId: string): BatchRequest[] {
    // Ensure the account ID has the proper format
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    
    console.log('[META FUNNEL] Building batch requests for account:', formattedId);
    
    // Use more comprehensive fields and include date_preset directly in the URL
    // Include effective_status to ensure we get all campaign statuses
    const campaignsUrl = `/${formattedId}/campaigns?fields=id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}`;
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
