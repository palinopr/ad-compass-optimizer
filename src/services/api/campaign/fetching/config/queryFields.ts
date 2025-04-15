
export const CAMPAIGN_FIELDS = {
  BASIC: [
    'id',
    'name',
    'status',
    'effective_status',
    'daily_budget',
    'lifetime_budget',
    'objective',
    'created_time',
    'updated_time',
    'start_time',
    'end_time'
  ],
  INSIGHTS: [
    'impressions',
    'clicks',
    'spend',
    'actions',
    'cost_per_action_type'
  ]
} as const;
