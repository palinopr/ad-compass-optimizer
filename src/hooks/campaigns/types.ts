
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

export interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  filteredCampaigns: MetaCampaign[];
  isLoading: boolean;
  error: string | null;
  errorDetails: any;
  refetchCampaigns: (forceRefresh?: boolean) => Promise<void>;
  displayRefresh: number;
  forceRender: number;
  forceUiRefresh: () => void;
  fetchCompleted?: boolean;
  insightsFetchStatus?: 'pending' | 'success' | 'partial' | 'failed' | null;
}
