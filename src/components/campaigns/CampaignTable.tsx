
import React, { useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CampaignTableProps {
  campaigns: MetaCampaign[];
  status?: 'active' | 'draft' | 'archived';
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, status = 'active', campaignsFetchStatus }) => {
  // Log render information to help debug
  useEffect(() => {
    console.log(`[UI] Rendering raw CampaignTable with ${campaigns?.length || 0} campaigns`);
    
    if (!campaigns || campaigns.length === 0) {
      console.warn("[UI] CampaignTable received empty campaigns array");
    }
    
    // Add debug log to show all campaigns at render
    if (campaigns && campaigns.length > 0) {
      console.log("[UI] Raw campaign data in CampaignTable:", campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status
      })));
    }
  }, [campaigns]);

  // Make sure we have valid campaign data
  if (!campaigns) {
    console.error('[UI] Campaigns is null or undefined in CampaignTable');
    return (
      <CardContent className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Campaign Data</AlertTitle>
          <AlertDescription>
            Unable to load campaign data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }
  
  // If campaigns is an empty array, show the warning message
  if (!campaigns.length) {
    return (
      <CardContent className="p-4">
        <div style={{ background: 'orange', padding: '15px', color: 'black', borderRadius: '5px' }}>
          ⚠ CampaignTable received empty array — check fetcher
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-4">
      <div className="bg-yellow-100 p-4 mb-4 rounded-md border border-yellow-300">
        <h3 className="font-bold text-yellow-800">✅ Raw Campaign Data: {campaigns.length} campaigns</h3>
      </div>
      
      <div className="space-y-2">
        {campaigns.map((campaign, index) => (
          <div 
            key={campaign?.id || index} 
            className="p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-col"
          >
            <div className="font-medium">{campaign?.name || 'Unnamed Campaign'}</div>
            <div className="text-sm font-mono bg-gray-100 p-1 rounded mt-1">ID: {campaign?.id || 'N/A'}</div>
            {campaign?.status && <div className="text-xs text-gray-500 mt-1">Status: {campaign.status}</div>}
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default CampaignTable;
