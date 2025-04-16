
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
    console.log("[CampaignTable] Rendering with campaigns:", campaigns);
    
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

  // Make sure we have valid campaign data - enhanced safety checks
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
  
  if (!Array.isArray(campaigns)) {
    console.error('[CAMPAIGN TABLE] Campaigns is not an array:', campaigns);
    return (
      <CardContent className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Data Format</AlertTitle>
          <AlertDescription>
            The campaign data is not in the expected format. Please contact support.
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

  // Debug banner - include count of campaigns with and without insights
  const campaignsWithInsights = campaigns.filter(c => c.insights && Object.keys(c.insights).length > 0).length;
  const campaignsWithoutInsights = campaigns.length - campaignsWithInsights;

  // Always render the table, even if some campaigns are missing insights
  return (
    <CardContent className="p-0">
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <p className="text-sm font-medium text-blue-800">
          Rendering {campaigns.length} campaigns ({campaignsWithInsights} with insights, {campaignsWithoutInsights} without)
        </p>
        <p className="text-xs text-blue-600">
          Campaigns will display even without insights data.
        </p>
      </div>
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
            
            // Force rendering of all campaigns regardless of status or insights
            console.log(`✅ [RENDER] Campaign row: ${campaign.name} (${campaign.id})`);
            
            // Always render the campaign, regardless of insights or status
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
    </CardContent>
  );
};

export default CampaignTable;
