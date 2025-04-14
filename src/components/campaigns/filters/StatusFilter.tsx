
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface StatusFilterProps {
  currentStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const StatusFilter = ({ currentStatus, onStatusChange }: StatusFilterProps) => {
  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Deleted', value: 'deleted' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" />
          Status
          {currentStatus && (
            <Badge variant="secondary" className="ml-1 capitalize">
              {currentStatus}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.label}
            checked={currentStatus === option.value}
            onCheckedChange={() => onStatusChange(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusFilter;
