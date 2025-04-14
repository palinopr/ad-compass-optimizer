
import { useState, useMemo } from 'react';
import { FunnelData } from '@/services/api/types/funnelTypes';

type SortField = 'spend' | 'ctr' | 'impressions' | 'none';
type SortDirection = 'asc' | 'desc';

export const useFunnelFilters = (data: FunnelData) => {
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getMetricValue = (item: any, field: string): number => {
    if (field === 'spend') {
      return parseFloat(item.spend?.replace(/[$,]/g, '') || '0');
    }
    if (field === 'ctr') {
      return parseFloat(item.insights?.ctr?.replace(/%/g, '') || '0');
    }
    if (field === 'impressions') {
      return parseInt(item.insights?.impressions?.replace(/,/g, '') || '0');
    }
    return 0;
  };

  const sortItems = <T extends { name: string }>(items: T[]): T[] => {
    if (sortField === 'none') return items;

    return [...items].sort((a, b) => {
      const valueA = getMetricValue(a, sortField);
      const valueB = getMetricValue(b, sortField);
      return sortDirection === 'desc' ? valueB - valueA : valueA - valueB;
    });
  };

  const filterByStatus = <T extends { status: string }>(items: T[]): T[] => {
    if (!statusFilter) return items;
    return items.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
  };

  const filterBySearch = <T extends { name: string }>(items: T[]): T[] => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(query));
  };

  const filteredData = useMemo(() => {
    const filteredCampaigns = filterBySearch(filterByStatus(data.campaigns));
    const sortedCampaigns = sortItems(filteredCampaigns);

    return {
      campaigns: sortedCampaigns,
      adsets: data.adsets.filter(adset => 
        filterBySearch([adset]).length > 0 &&
        (!statusFilter || adset.status.toLowerCase() === statusFilter.toLowerCase())
      ),
      ads: data.ads.filter(ad => 
        filterBySearch([ad]).length > 0 &&
        (!statusFilter || ad.status.toLowerCase() === statusFilter.toLowerCase())
      )
    };
  }, [data, sortField, sortDirection, statusFilter, searchQuery]);

  return {
    filteredData,
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    setSortField,
    setSortDirection,
    setStatusFilter,
    setSearchQuery
  };
};
