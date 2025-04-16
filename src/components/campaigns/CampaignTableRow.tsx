
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import CampaignStatusBadge from './table-components/CampaignStatusBadge';
import CampaignMetrics from './table-components/CampaignMetrics';
import CampaignActions from './table-components/CampaignActions';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CampaignTableRowProps {
  campaign: MetaCampaign;  // Explicitly typed as MetaCampaign from the import
  status: 'active' | 'draft' | 'archived';
  loadedFromFallback?: boolean;
}

const CampaignTableRow: React.FC<CampaignTableRowProps> = (props: CampaignTableRowProps) => {
  // Force TypeScript to use the proper type from metaCampaignTypes.ts
  const { campaign, status, loadedFromFallback } = props;
  const [isBlocked, setIsBlocked] = React.useState(false);

  React.useEffect(() => {
    // Explicitly cast insightsStatus to ensure TypeScript recognizes 'blocked'
    if ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) === 'blocked') {
      setIsBlocked(true);
      return;
    }
    
    // THOROUGH CHECK: Check all possible sources that could indicate this campaign is blocked
    try {
      // First check blocked campaigns list in localStorage
      const blockedCampaigns = JSON.parse(localStorage.getItem('permanently_blocked_campaigns') || '[]');
      if (blockedCampaigns.includes(campaign.id)) {
        setIsBlocked(true);
        
        // Only update if not already blocked
        if ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) !== 'blocked') {
          console.log(`[CAMPAIGN ROW] 🚫 Marking ${campaign.id} as blocked from localStorage list`);
          // Use type assertion to ensure TypeScript understands this assignment
          campaign.insightsStatus = 'blocked' as 'ok' | 'pending' | 'failed' | 'blocked' | null;
          campaign.insights = null;
        }
        return;
      }
      
      // Then check failed signatures for object-specific failures
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      const objectFailSignature = `object-${campaign.id}-failed`;
      if (failedSignatures.includes(objectFailSignature)) {
        setIsBlocked(true);
        
        // Only update if not already blocked
        if ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) !== 'blocked') {
          console.log(`[CAMPAIGN ROW] 🚫 Marking ${campaign.id} as blocked from failed signatures`);
          campaign.insightsStatus = 'blocked' as 'ok' | 'pending' | 'failed' | 'blocked' | null;
          campaign.insights = null;
          
          // Also update the blocked campaigns list for consistency
          if (!blockedCampaigns.includes(campaign.id)) {
            blockedCampaigns.push(campaign.id);
            localStorage.setItem('permanently_blocked_campaigns', JSON.stringify(blockedCampaigns));
          }
        }
        return;
      }
      
      // Finally check the 400 failures log
      try {
        const failed400s = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
        const hasFailure = failed400s.some((failure: any) => failure.campaignId === campaign.id);
        
        if (hasFailure) {
          setIsBlocked(true);
          
          // Only update if not already blocked
          if ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) !== 'blocked') {
            console.log(`[CAMPAIGN ROW] 🚫 Marking ${campaign.id} as blocked from 400 failures log`);
            campaign.insightsStatus = 'blocked' as 'ok' | 'pending' | 'failed' | 'blocked' | null;
            campaign.insights = null;
            
            // Update the other data sources for consistency
            if (!blockedCampaigns.includes(campaign.id)) {
              blockedCampaigns.push(campaign.id);
              localStorage.setItem('permanently_blocked_campaigns', JSON.stringify(blockedCampaigns));
            }
            
            if (!failedSignatures.includes(objectFailSignature)) {
              failedSignatures.push(objectFailSignature);
              localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
            }
          }
        }
      } catch (e) {
        // Ignore 400 failures storage errors
      }
    } catch (e) {
      console.error('[CAMPAIGN ROW] Error checking blocked status:', e);
    }
  }, [campaign]);

  React.useEffect(() => {
    if (!campaign.id || !campaign.name) {
      console.warn(`[CAMPAIGN ROW] ⚠️ Invalid campaign data:`, campaign);
      return;
    }

    if ((!campaign.insights || Object.keys(campaign.insights).length === 0) && campaign.name && campaign.status) {
      console.log(`[CAMPAIGN ROW] ⚠️ Rendering campaign ${campaign.id} without insights due to prior failure`);
      
      if (isBlocked || (campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) === 'blocked') {
        console.log(`[CAMPAIGN ROW] 🚫 Campaign "${campaign.name}" (${campaign.id}) is blocked from insights fetching`);
      }
      
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

  // Check if we have minimal valid data to render the row
  if (!campaign.id || !campaign.name) {
    console.warn('[CAMPAIGN ROW] Skipping invalid campaign (missing ID or name):', campaign);
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
          isBlocked={isBlocked || ((campaign.insightsStatus as 'ok' | 'pending' | 'failed' | 'blocked' | null) === 'blocked')}
        />
      </TableCell>
      <TableCell className="text-right">
        <CampaignActions status={status} />
      </TableCell>
    </TableRow>
  );
};

export default CampaignTableRow;
