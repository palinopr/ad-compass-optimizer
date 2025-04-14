
import { BatchRequest } from '../batch/MetaBatchService';

export class MetaFunnelBatchService {
  public static buildBatchRequests(adAccountId: string): BatchRequest[] {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    
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
