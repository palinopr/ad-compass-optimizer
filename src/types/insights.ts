
export interface InsightTimeRange {
  since: string;
  until: string;
}

export interface InsightOptions {
  fields: string[];
  timeIncrement: number;
  timeRange?: InsightTimeRange;
  datePreset?: string;
}

export interface InsightFilterOptions {
  datePreset?: string;
  timeRange?: InsightTimeRange;
  fields?: string[];
  timeIncrement?: number;
  // Add campaignStatus property to fix type errors
  campaignStatus?: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | string;
}
