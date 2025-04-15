
import { MetaCampaign } from '@/services/api/MetaCampaignService';

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
}

export interface CampaignFilters {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  datePreset: string | null; // API compatible preset
  status: string | null;
  searchQuery: string;
}
