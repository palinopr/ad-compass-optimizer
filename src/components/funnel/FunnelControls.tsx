
import React from 'react';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Update the prop types to match the types from useFunnelFilters
interface FunnelControlsProps {
  sortField: 'spend' | 'ctr' | 'impressions' | 'none';
  sortDirection: 'asc' | 'desc';
  statusFilter: string | null;
  searchQuery: string;
  onSortFieldChange: (value: 'spend' | 'ctr' | 'impressions' | 'none') => void;
  onSortDirectionChange: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onSearchChange: (value: string) => void;
}

const FunnelControls: React.FC<FunnelControlsProps> = ({
  sortField,
  sortDirection,
  statusFilter,
  searchQuery,
  onSortFieldChange,
  onSortDirectionChange,
  onStatusFilterChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Select value={sortField} onValueChange={onSortFieldChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No sorting</SelectItem>
            <SelectItem value="spend">Spend</SelectItem>
            <SelectItem value="ctr">CTR</SelectItem>
            <SelectItem value="impressions">Impressions</SelectItem>
          </SelectContent>
        </Select>
        {sortField !== 'none' && (
          <Button
            variant="outline"
            size="icon"
            onClick={onSortDirectionChange}
            className="h-10 w-10"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select 
        value={statusFilter || ''} 
        onValueChange={(value) => onStatusFilterChange(value === '' ? null : value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search campaigns, ad sets, or ads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
};

export default FunnelControls;
