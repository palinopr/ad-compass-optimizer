
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

const CampaignFilteredResults: React.FC<CampaignFilteredResultsProps> = ({
  campaigns,
  status,
  hasFilteredResults,
  onClearFilters
}) => {
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
  if (!campaigns || campaigns.length === 0) {
    // NEW: Warning banner for empty campaigns
    return (
      <Card>
        <div className="p-4">
          <div style={{ background: 'orange', padding: '15px', color: 'black', borderRadius: '5px', marginBottom: '15px' }}>
            ⚠ No campaigns available to display - check fetcher pipeline
          </div>
          
          <div className="p-4 text-center space-y-4">
            <p className="text-gray-500">
              {isMockMode 
                ? "No mock campaigns available."
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
              <Button 
                variant="outline" 
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // When we have campaigns to show
  return (
    <Card>
      <div className="bg-green-100 p-4 border-b border-green-200">
        <h3 className="text-lg font-bold text-green-800">✅ Displaying {campaigns.length} Raw Campaigns</h3>
        <p className="text-sm text-green-700">Unfiltered campaign data directly from API</p>
      </div>
      <CampaignTable 
        campaigns={campaigns} 
        status={campaignStatus} 
        key={`campaign-table-${campaigns.length}`} // Force re-render when campaigns change
      />
    </Card>
  );
}

export default CampaignFilteredResults;
