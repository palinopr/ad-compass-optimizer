
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';
import CampaignSearch from './CampaignSearch';
import { CampaignFilters } from '@/hooks/campaigns/useCampaignFilters';

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
  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Deleted', value: 'deleted' },
    { label: 'Archived', value: 'archived' },
  ];
  
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <DateRangeSelector 
          onChange={onDateRangeChange} 
          initialPreset={filters.datePreset}
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Status
                {filters.status && (
                  <Badge variant="secondary" className="ml-1 capitalize">
                    {filters.status}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.label}
                  checked={filters.status === option.value}
                  onCheckedChange={() => onStatusChange(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <CampaignSearch value={filters.search} onChange={onSearchChange} />
    </div>
  );
};

export default CampaignFilterToolbar;
