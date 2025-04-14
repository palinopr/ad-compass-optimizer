
import React from 'react';
import { CampaignFilters } from '@/hooks/campaigns/useCampaignFilters';
import DateRangeFilter from './filters/DateRangeFilter';
import StatusFilter from './filters/StatusFilter';
import RefreshButton from './filters/RefreshButton';
import CampaignSearch from './CampaignSearch';

interface CampaignFilterToolbarProps {
  filters: CampaignFilters;
  onDateRangeChange: (range: any, preset: string) => void;
  onStatusChange: (status: string | null) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const CampaignFilterToolbar: React.FC<CampaignFilterToolbarProps> = ({
  filters,
  onDateRangeChange,
  onStatusChange,
  onSearchChange,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <DateRangeFilter 
          datePreset={filters.datePreset}
          onDateRangeChange={onDateRangeChange}
        />
        <div className="flex gap-2">
          <StatusFilter
            currentStatus={filters.status}
            onStatusChange={onStatusChange}
          />
          <RefreshButton
            onClick={onRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>
      <CampaignSearch value={filters.search} onChange={onSearchChange} />
    </div>
  );
};

export default CampaignFilterToolbar;
