
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CampaignTable from './CampaignTable';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { ExternalLink } from 'lucide-react';

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
  // Cast status to the correct type for CampaignTable
  const campaignStatus = status as 'active' | 'draft' | 'archived';

  // Handle empty state with no filters
  if (campaigns.length === 0 && !hasFilteredResults) {
    return (
      <Card>
        <div className="p-8 text-center space-y-4">
          <p className="text-gray-500">No campaigns found in this ad account.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              asChild
            >
              <a 
                href="https://business.facebook.com/adsmanager/create"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Create Campaign in Meta
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Handle filtered results
  if (hasFilteredResults) {
    return (
      <Card>
        <CampaignTable campaigns={campaigns} status={campaignStatus} />
      </Card>
    );
  }

  // Handle when filters are applied but no results found
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
