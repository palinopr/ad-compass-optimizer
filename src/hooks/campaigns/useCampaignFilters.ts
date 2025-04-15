
import { useState, useCallback, useMemo, useEffect } from 'react';
import { DateRange } from '@/components/meta/filters/DateRangeSelector';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

export type CampaignFilters = {
  dateRange: DateRange;
  datePreset: string;
  status: string | null;
  search: string;
};

export function useCampaignFilters(campaigns: MetaCampaign[] = []) {
  const [filters, setFilters] = useState<CampaignFilters>({
    dateRange: null,
    datePreset: 'last_28d',  // Updated from 'last30days'
    status: null,
    search: '',
  });

  // Initialize with default date range (28 days)
  useEffect(() => {
    const today = new Date();
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(today.getDate() - 28); // Updated from 30 to 28
    setFilters(prev => ({
      ...prev,
      dateRange: { from: twentyEightDaysAgo, to: today }
    }));
  }, []);

  const setDateRange = useCallback((dateRange: DateRange, preset: string) => {
    setFilters(prev => ({ ...prev, dateRange, datePreset: preset }));
  }, []);

  const setStatusFilter = useCallback((status: string | null) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);

  const setSearchQuery = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const filteredCampaigns = useMemo(() => {
    // Check if we're in mock mode
    const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
    
    return campaigns.filter(campaign => {
      // Filter by status if specified
      if (filters.status && filters.status !== 'all' && 
          campaign.status && campaign.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Filter by search query
      if (filters.search && campaign.name && 
          !campaign.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filter by date range if set and not in mock mode and created_time exists
      // For mock data, we don't filter by date since the dates are simulated
      if (!isMockMode && filters.dateRange?.from && filters.dateRange?.to && campaign.created_time) {
        const campaignDate = new Date(campaign.created_time);
        return campaignDate >= filters.dateRange.from && campaignDate <= filters.dateRange.to;
      }

      return true;
    });
  }, [campaigns, filters]);

  return {
    filters,
    setDateRange,
    setStatusFilter,
    setSearchQuery,
    filteredCampaigns
  };
}
