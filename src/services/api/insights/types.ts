/**
 * Type definitions for the Meta Insights API
 */

/**
 * Represents filtering options for insights requests
 */
export interface InsightFilterOptions {
  datePreset?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 
               'last_month' | 'this_quarter' | 'lifetime' | 'last_3d' | 'last_7d' |
               'last_14d' | 'last_28d' | 'last_30d' | 'last_90d' | 'last_week_mon_sun' |
               'last_week_sun_sat' | 'last_quarter' | 'last_year' | 'this_week_mon_today' |
               'this_week_sun_today' | 'this_year' | 'maximum';
  timeRange?: {
    since: string;
    until: string;
  };
  timeIncrement?: number;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAIN' | 'NOT_CONTAIN' | 'ANY' | 'ALL' | 'NONE';
    value: string | string[] | number;
  }>;
  sort?: string;
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
