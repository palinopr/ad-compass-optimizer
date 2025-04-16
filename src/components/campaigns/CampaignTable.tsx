
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
    console.log(`[CAMPAIGN TABLE] Rendering with ${campaigns?.length || 0} campaigns`, 
      campaigns && campaigns.length > 0 ? { 
        firstCampaign: {
          id: campaigns[0]?.id || 'missing-id',
          name: campaigns[0]?.name || 'unnamed',
          hasInsights: !!campaigns[0]?.insights,
          insightKeys: campaigns[0]?.insights ? Object.keys(campaigns[0].insights) : [],
          insightsStatus: campaigns[0]?.insightsStatus || 'unknown'
        }
      } : { campaigns: 'empty or null' }
    );
    
    // Add debug log to show all campaigns and their block status
    if (campaigns && campaigns.length > 0) {
      console.log("🧾 Campaigns at render:", campaigns.map(c => ({
        id: c.id,
        name: c.name,
        insightsStatus: c.insightsStatus || 'unknown'
      })));
      
      // Check and log if any campaigns are missing insights
      const missingInsights = campaigns.filter(c => !c.insights || Object.keys(c.insights).length === 0);
      if (missingInsights.length > 0) {
        console.log(`[CAMPAIGN TABLE] ${missingInsights.length}/${campaigns.length} campaigns are missing insights data`);
      }
      
      // Check for blocked campaigns
      const blockedCampaigns = campaigns.filter(c => c.insightsStatus === 'blocked');
      if (blockedCampaigns.length > 0) {
        console.log(`[CAMPAIGN TABLE] ${blockedCampaigns.length}/${campaigns.length} campaigns are blocked after 400 errors`);
      }
    } else {
      console.log('[CAMPAIGN TABLE] No campaigns to render');
    }
    
    // Log permission status
    console.log(`[CAMPAIGN TABLE] Meta permissions invalid: ${metaPermissionsInvalid}`);
  }, [campaigns]);

  // Show Meta permissions error message
  if (metaPermissionsInvalid) {
    return (
      <CardContent className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Meta Permissions Error</AlertTitle>
          <AlertDescription>
            ❌ Unable to load campaigns: Missing Meta permissions for insights access.
            Please reconnect your Meta account or request access.
          </AlertDescription>
        </Alert>
        {campaigns && campaigns.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Available Campaign Names:</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {campaigns.slice(0, 10).map(campaign => (
                <li key={campaign.id}>{campaign.name}</li>
              ))}
              {campaigns.length > 10 && <li>...and {campaigns.length - 10} more</li>}
            </ul>
          </div>
        )}
      </CardContent>
    );
  }

  // Show unauthorized error message
  if (campaignsFetchStatus === 'unauthorized') {
    return (
      <CardContent className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            ⚠️ No permission to view this ad account's campaigns.
            Please reconnect your Meta account or verify ad account permissions.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  // Make sure we have valid campaign data
  if (!campaigns || !Array.isArray(campaigns)) {
    console.error('[CAMPAIGN TABLE] Invalid campaigns data:', campaigns);
    return (
      <CardContent className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Format Error</AlertTitle>
          <AlertDescription>
            Unable to display campaigns due to invalid data format.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  // If we have no campaigns, show a message
  if (campaigns.length === 0) {
    return (
      <CardContent className="p-4">
        <div className="text-center py-8 text-muted-foreground">
          No campaigns found. Create a campaign to get started.
        </div>
      </CardContent>
    );
  }

  // Always render the table, even if some campaigns are missing insights
  return (
    <CardContent className="p-0">
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
            // Ensure campaign has an ID to use as a key
            const key = campaign.id || Math.random().toString(36);
            
            // Even if the campaign data is incomplete, try to render it
            return (
              <CampaignTableRow 
                key={key}
                campaign={campaign} 
                status={status}
              />
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  );
};

export default CampaignTable;
