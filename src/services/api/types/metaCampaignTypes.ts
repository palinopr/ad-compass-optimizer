
// Define the CampaignExtraStats interface in this file to avoid circular dependencies
export interface CampaignExtraStats {
  results: string;
  cpa: string;
  roas: string;
  spend?: string;
  clicks?: string;
  impressions?: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget?: string;
  spend?: string;
  results?: string;
  cost_per_result?: string;
  created_time?: string;
  updated_time?: string;
  start_time?: string;
  end_time?: string;
  objective?: string;
  loadedFromFallback?: boolean;
  extraStats?: CampaignExtraStats;
  insights?: {
    impressions: string;
    clicks: string;
    spend: string;
    cpa?: string;
    roas?: string;
    cost_per_action_type: Array<{
      action_type: string;
      value: string;
    }>;
    actions: Array<{
      action_type: string;
      value: string;
    }>;
  };
}
