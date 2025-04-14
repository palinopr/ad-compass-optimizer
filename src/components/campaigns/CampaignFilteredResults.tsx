
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
  
  // Check if mock mode is active
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";

  console.log('CampaignFilteredResults render:', {
    campaignsCount: campaigns.length,
    hasFilteredResults,
    mockMode: isMockMode
  });

  // Handle empty state with no filters
  if (campaigns.length === 0) {
    // In mock mode, this shouldn't typically happen since we load mock data
    return (
      <Card>
        <div className="p-8 text-center space-y-4">
          <p className="text-gray-500">
            {isMockMode 
              ? "No mock campaigns match the current filter settings."
              : "No campaigns found in this ad account."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isMockMode && (
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
            )}
            {!hasFilteredResults && campaigns.length === 0 && (
              <Button 
                variant="outline" 
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // When we have campaigns to show
  return (
    <Card>
      <CampaignTable campaigns={campaigns} status={campaignStatus} />
    </Card>
  );
}

export default CampaignFilteredResults;
