
import { useState, useCallback, useMemo } from 'react';
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
    datePreset: 'last30days',
    status: null,
    search: '',
  });

  // Initialize with default date range (last 30 days)
  useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setFilters(prev => ({
      ...prev,
      dateRange: { from: thirtyDaysAgo, to: today }
    }));
  });

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
    return campaigns.filter(campaign => {
      // Filter by status if specified
      if (filters.status && campaign.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Filter by search query
      if (filters.search && !campaign.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filter by date range if set
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const campaignDate = campaign.created_time ? new Date(campaign.created_time) : null;
        if (campaignDate) {
          return campaignDate >= filters.dateRange.from && campaignDate <= filters.dateRange.to;
        }
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
