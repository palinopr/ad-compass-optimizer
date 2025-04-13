
// Campaign hook types
import { MetaCampaign } from '@/services/api/MetaCampaignService';

export interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  errorDetails?: any;
  refetchCampaigns: () => void;
}

export interface CampaignErrorDetails {
  error?: {
    type?: string;
    message?: string;
    code?: number;
    timestamp?: string;
  };
}
