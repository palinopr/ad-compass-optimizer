import React, { useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CampaignTableRow from './CampaignTableRow';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { metaPermissionsInvalid } from '@/hooks/campaigns/useCampaigns';

interface CampaignTableProps {
  campaigns: MetaCampaign[];
  status?: 'active' | 'draft' | 'archived';
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, status = 'active', campaignsFetchStatus }) => {
  // Log render information to help debug
  useEffect(() => {
    console.log(`🔍 [CAMPAIGN TABLE] Rendering campaign table with ${campaigns?.length || 0} campaigns`);
    
    if (!campaigns || campaigns.length === 0) {
      console.warn("Campaign data is empty at CampaignTable");
    }
    
    // Add debug log to show all campaigns at render
    if (campaigns && campaigns.length > 0) {
      console.log("🧾 Campaign list at render:", campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        insightsStatus: c.insightsStatus || 'unknown',
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    } else {
      console.warn('[CAMPAIGN TABLE] ⚠️ No campaigns to render in table');
    }
  }, [campaigns]);

  // Make sure we have valid campaign data
  if (!campaigns) {
    console.error('[CAMPAIGN TABLE] Campaigns is null or undefined');
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
  
  // Add a visible banner showing the number of campaigns loaded
  return (
    <CardContent className="p-0">
      <div style={{ background: '#fffae6', padding: '10px', fontWeight: 'bold' }}>
        ✅ Rendering fallback active — Campaigns loaded: {campaigns.length}
      </div>
      
      {/* Temporary replacement for the table to force visibility */}
      <div>
        {campaigns.map((c, i) => (
          <div key={i} style={{ padding: '10px', background: '#f9f9f9', marginBottom: '5px' }}>
            🔍 Render test: {c?.name || 'Unnamed'} — ID: {c?.id || 'No ID'}
          </div>
        ))}
      </div>
      
      {/* Original table code is commented out for now */}
      {/* 
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Spent</TableHead>
            <TableHead>Results</TableHead>
            <TableHead>CPA</TableHead>
            <TableHead>ROAS</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const key = campaign.id || Math.random().toString(36);
            console.log(`✅ [RENDER] Campaign row: ${campaign.name} (${campaign.id})`);
            return (
              <CampaignTableRow 
                key={key}
                campaign={campaign} 
                status={status}
                loadedFromFallback={!!localStorage.getItem('using_fallback_campaigns')}
              />
            );
          })}
        </TableBody>
      </Table>
      */}
    </CardContent>
  );
};

export default CampaignTable;
