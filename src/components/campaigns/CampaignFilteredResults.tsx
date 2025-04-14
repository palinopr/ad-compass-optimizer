
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CampaignTable from './CampaignTable';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { DateRange } from '@/components/meta/filters/DateRangeSelector';

interface CampaignFilteredResultsProps {
  campaigns: MetaCampaign[];
  status: string;
  hasFilteredResults: boolean;
  onClearFilters: () => void;
}

const CampaignFilteredResults = ({
  campaigns,
  status,
  hasFilteredResults,
  onClearFilters
}: CampaignFilteredResultsProps) => {
  if (hasFilteredResults) {
    return (
      <Card>
        <CampaignTable campaigns={campaigns} status={status as 'active' | 'draft' | 'archived'} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-8 text-center">
        <p className="text-gray-500">No campaigns match the current filters.</p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </Card>
  );
};

export default CampaignFilteredResults;
