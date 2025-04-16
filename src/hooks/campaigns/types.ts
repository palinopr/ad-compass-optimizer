
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

export interface UseCampaignsResult {
  campaigns: MetaCampaign[];
  filteredCampaigns: MetaCampaign[];
  isLoading: boolean;
  error: any;
  errorDetails: any;
  refetchCampaigns: (forceRefresh?: boolean) => Promise<void>;
  displayRefresh: number;
  forceRender: number;
  forceUiRefresh: () => void;
  fetchCompleted: boolean;
  insightsFetchStatus: 'pending' | 'success' | 'partial' | 'failed' | null;
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
  metaPermissionsInvalid?: boolean;
}

export interface UseCampaignFiltersResult {
  filteredCampaigns: MetaCampaign[];
  filters: {
    status?: string;
    search?: string;
    dateRange?: string;
  };
}

export interface UseCampaignFetchStateResult {
  campaigns: MetaCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<MetaCampaign[]>>;
  updateCampaigns: (campaigns: MetaCampaign[]) => Promise<{
    success: boolean;
    partial: boolean;
    campaigns?: MetaCampaign[];
    error?: any;
  }>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: any;
  setError: React.Dispatch<React.SetStateAction<any>>;
  errorDetails: any;
  setErrorDetails: React.Dispatch<React.SetStateAction<any>>;
  displayRefresh: number;
  incrementDisplayRefresh: () => void;
  forceRender: number;
  clearCampaigns: () => void;
  forceUiRefresh: () => void;
  hasEverHadCampaignsRef: React.MutableRefObject<boolean>;
  fetchCompleted: boolean;
  setFetchCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  insightsFetchStatus: 'pending' | 'success' | 'partial' | 'failed' | null;
  setInsightsFetchStatus: React.Dispatch<React.SetStateAction<'pending' | 'success' | 'partial' | 'failed' | null>>;
}

