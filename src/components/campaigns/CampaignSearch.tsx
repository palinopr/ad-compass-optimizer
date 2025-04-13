
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CampaignSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const CampaignSearch: React.FC<CampaignSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search campaigns..."
        className="pl-8 pr-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-9 px-2"
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear</span>
        </Button>
      )}
    </div>
  );
};

export default CampaignSearch;
