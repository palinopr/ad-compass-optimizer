
import { BatchRequest } from '../batch/MetaBatchService';

export class MetaFunnelBatchService {
  public static buildBatchRequests(adAccountId: string): BatchRequest[] {
    // Ensure the account ID has the proper format
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    
    console.log('[META FUNNEL] Building batch requests for account:', formattedId);
    
    // Return properly formatted batch requests
    return [
      {
        method: 'GET',
        relative_url: `${formattedId}/campaigns?fields=id,name,objective,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget`,
        name: 'campaigns'
      },
      {
        method: 'GET',
        relative_url: `${formattedId}/adsets?fields=id,name,campaign_id,status`,
        name: 'adsets'
      },
      {
        method: 'GET',
        relative_url: `${formattedId}/ads?fields=id,name,adset_id,status`,
        name: 'ads'
      }
    ];
  }
}
