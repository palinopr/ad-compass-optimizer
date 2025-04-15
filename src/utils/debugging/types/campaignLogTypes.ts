
export interface ErrorDetails {
  code: string | number;
  type: string;
  message: string;
  subcode?: string | number;
  fbtraceId?: string;
  timestamp: string;
  requestUrl?: string;
  httpStatus?: number;
  rawResponse?: string;
  rateLimitInfo?: string;
}

export interface CampaignFetchLog {
  timestamp: string;
  requestTimestamp?: string;
  accountId: string;
  status?: number;
  statusText?: string;
  responseBody?: string;
  parsedJson?: any;
  error?: ErrorDetails;
  insightsData?: boolean;
  datePreset?: string;
  queryParams?: string;
  requestUrl?: string;
  campaignPreviews?: CampaignPreview[];
  headers?: Record<string, string>;
  requestDetails?: {
    url: string;
    headers: Record<string, string>;
    status: number;
    statusText: string;
  };
}

export interface CampaignPreview {
  id: string;
  name: string;
  status: string;
  spend: string;
  results: string;
}
