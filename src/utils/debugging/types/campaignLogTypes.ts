
export interface CampaignFetchLog {
  timestamp: string;
  accountId: string;
  status?: number;
  statusText?: string;
  responseBody?: string;
  parsedJson?: any;
  error?: string;
  insightsData?: boolean;
  datePreset?: string;
  queryParams?: string;
  requestUrl?: string;
  campaignPreviews?: Array<{
    id: string;
    name: string;
    status: string;
    spend: string;
    results: string;
  }>;
}

export interface CampaignPreview {
  id: string;
  name: string;
  status: string;
  spend: string;
  results: string;
}
