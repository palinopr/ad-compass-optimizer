
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import CampaignStatusBadge from './table-components/CampaignStatusBadge';
import CampaignMetrics from './table-components/CampaignMetrics';
import CampaignActions from './table-components/CampaignActions';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CampaignTableRowProps {
  campaign: MetaCampaign;
  status: 'active' | 'draft' | 'archived';
  loadedFromFallback?: boolean;
}

const CampaignTableRow: React.FC<CampaignTableRowProps> = ({ campaign, status, loadedFromFallback }) => {
  const [isBlocked, setIsBlocked] = React.useState(false);

  // Check if this campaign ID has been marked as permanently failed or has insightsStatus='blocked'
  React.useEffect(() => {
    // Check directly if campaign is already marked with blocked status
    if (campaign.insightsStatus === 'blocked') {
      setIsBlocked(true);
      return;
    }
    
    // Also check if campaign is in the blocked list
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem('permanently_blocked_campaigns') || '[]');
      if (blockedCampaigns.includes(campaign.id)) {
        setIsBlocked(true);
        
        // Update campaign's insightsStatus for consistency if not already set
        if (campaign.insightsStatus !== 'blocked') {
          campaign.insightsStatus = 'blocked';
          campaign.insights = null;
        }
      }
    } catch (e) {
      console.error('[CAMPAIGN ROW] Error checking blocked campaigns:', e);
    }
    
    // Secondary check for object-specific failure signatures
    const objectFailSignature = `object-${campaign.id}-failed`;
    const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
    if (failedSignatures.includes(objectFailSignature)) {
      setIsBlocked(true);
      
      // Update campaign's insightsStatus for consistency if not already set
      if (campaign.insightsStatus !== 'blocked') {
        campaign.insightsStatus = 'blocked';
        campaign.insights = null;
      }
    }
  }, [campaign]);

  // Log campaign render state for debugging
  React.useEffect(() => {
    // Basic validation check
    if (!campaign.id || !campaign.name) {
      console.warn(`[CAMPAIGN ROW] ⚠️ Invalid campaign data:`, campaign);
      return;
    }

    // Log when insights data is missing but campaign has valid metadata
    if ((!campaign.insights || Object.keys(campaign.insights).length === 0) && campaign.name && campaign.status) {
      console.log(`[CAMPAIGN ROW] Campaign "${campaign.name}" (${campaign.id}) rendering with metadata only - insights unavailable`);
      
      // Log if this campaign is blocked
      if (isBlocked || campaign.insightsStatus === 'blocked') {
        console.log(`[CAMPAIGN ROW] 🚫 Campaign "${campaign.name}" (${campaign.id}) is blocked from insights fetching`);
      }
      
      // Store metadata-only stat for monitoring
      try {
        const metadataOnlyCampaigns = JSON.parse(localStorage.getItem('metadata_only_campaigns') || '[]');
        if (!metadataOnlyCampaigns.includes(campaign.id)) {
          metadataOnlyCampaigns.push(campaign.id);
          localStorage.setItem('metadata_only_campaigns', JSON.stringify(metadataOnlyCampaigns));
        }
      } catch (e) {
        console.error('[CAMPAIGN ROW] Error storing metadata-only campaign:', e);
      }
    }
  }, [campaign, isBlocked]);

  // Don't render if we don't have basic metadata
  if (!campaign.id || !campaign.name) {
    console.warn('[CAMPAIGN ROW] Skipping invalid campaign:', campaign);
    return null;
  }

  return (
    <TableRow className={isBlocked ? 'opacity-75' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          {campaign.name}
          {loadedFromFallback && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Partial Data: Limited campaign information available</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isBlocked && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info size={16} className="text-yellow-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Insights Blocked: This campaign's insights cannot be fetched due to API restrictions</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>
      <TableCell>
        <CampaignStatusBadge status={campaign.status} />
      </TableCell>
      <TableCell colSpan={5}>
        <CampaignMetrics 
          budget={campaign.budget}
          dailyBudget={campaign.daily_budget}
          lifetimeBudget={campaign.lifetime_budget}
          spend={campaign.insights?.spend}
          results={campaign.results}
          insights={campaign.insights}
          extraStats={campaign.extraStats}
          isBlocked={isBlocked || campaign.insightsStatus === 'blocked'}
        />
      </TableCell>
      <TableCell className="text-right">
        <CampaignActions status={status} />
      </TableCell>
    </TableRow>
  );
};

export default CampaignTableRow;
