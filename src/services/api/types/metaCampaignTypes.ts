
export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget?: string; // Derived field
  spend?: string; // Derived field
  results?: string; // Derived field
  cost_per_result?: string;
  created_time?: string;
  updated_time?: string;
  start_time?: string;
  end_time?: string;
  objective?: string;
  insights?: {
    impressions: string;
    clicks: string;
    spend: string;
    cpa?: string; // Derived field
    roas?: string; // Derived field
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
