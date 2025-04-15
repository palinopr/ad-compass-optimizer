
/**
 * Type definitions for the Meta Insights API
 */

/**
 * Represents filtering options for insights requests
 */
export interface InsightFilterOptions {
  datePreset?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 
               'last_3_months' | 'last_6_months' | 'this_quarter' | 'lifetime' | 
               'last_30d' | 'last_14d' | 'last_7d' | 'last_28d' | 'last30days' | 'last7days' | 'maximum';
  timeRange?: {
    since: string; // YYYY-MM-DD format
    until: string; // YYYY-MM-DD format
  };
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAIN' | 'NOT_CONTAIN' | 'ANY' | 'ALL' | 'NONE';
    value: string | string[] | number;
  }>;
  sort?: string; // e.g., 'reach_descending', 'spend_ascending'
  fields?: string[];
  attributionWindow?: ('1d_click' | '1d_view' | '7d_click' | '7d_view' | '28d_click' | '28d_view')[];
  breakdowns?: string[];
  limit?: number;
  useUnifiedAttribution?: boolean;
}

/**
 * Response interface for insights data
 */
export interface InsightsResponse {
  data: any[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
  summary?: {
    [key: string]: any;
  };
}
