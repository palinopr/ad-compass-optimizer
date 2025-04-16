
/**
 * Type definitions for the Meta Insights API
 */

import { ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

/**
 * Represents filtering options for insights requests
 */
export interface InsightFilterOptions {
  datePreset?: ValidMetaDatePreset;
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
