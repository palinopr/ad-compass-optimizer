
import { MetaCampaign } from '@/services/api/MetaCampaignService';

export interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  errorDetails?: any;
  refetchCampaigns: (forceRefresh?: boolean) => void;
  displayRefresh: number;
}

export interface CampaignFilterOptions {
  status?: string | null;
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  dateRangeType?: string;
}

export interface DatePreset {
  label: string;
  value: string;
  days: number;
}
