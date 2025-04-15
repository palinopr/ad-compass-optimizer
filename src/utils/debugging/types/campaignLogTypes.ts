
export interface CampaignFetchLog {
  timestamp: string;
  requestTimestamp?: string;
  accountId: string;
  status?: number;
  statusText?: string;
  responseBody?: string;
  parsedJson?: any;
  error?: string;
  errorDetails?: {
    status?: number;
    statusText?: string;
    message?: string;
    code?: string | number;
    type?: string;
    subcode?: string | number;
    timestamp?: string;
    fbTraceId?: string;
  };
  insightsData?: boolean;
  datePreset?: string;
  queryParams?: string;
  requestUrl?: string;
  campaignPreviews?: CampaignPreview[];
  headers?: Record<string, string>; // Add this property
}

export interface CampaignPreview {
  id: string;
  name: string;
  status: string;
  spend: string;
  results: string;
}
