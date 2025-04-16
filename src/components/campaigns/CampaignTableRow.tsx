
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
    if (campaign.insightsStatus === 'blocked') {
      setIsBlocked(true);
      return;
    }
    
    try {
      // Check if campaign is blocked in localStorage
      const blockedCampaigns = JSON.parse(localStorage.getItem('permanently_blocked_campaigns') || '[]');
      if (blockedCampaigns.includes(campaign.id)) {
        setIsBlocked(true);
        campaign.insightsStatus = 'blocked';
        campaign.insights = null;
      }
    } catch (e) {
      console.error('[CAMPAIGN ROW] Error checking blocked status:', e);
    }
  }, [campaign]);

  // Always log the campaign being rendered for debugging
  console.log("✅ [RENDER] Campaign row:", campaign.name, "(ID:", campaign.id, ")");
  
  // Use fallback values for essential fields to ensure we always render something
  const campaignName = campaign.name || "Unnamed Campaign";
  const campaignId = campaign.id || 'unknown-id';
  const campaignStatus = campaign.status || 'unknown';
  
  const hasInsights = campaign.insights && Object.keys(campaign.insights).length > 0;
  const hasValidMetrics = hasInsights || campaign.budget || campaign.daily_budget || campaign.lifetime_budget;

  // Always render the row regardless of data completeness
  return (
    <TableRow className={isBlocked ? 'opacity-75' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          {campaignName}
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
          {!hasValidMetrics && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">No Insights</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <CampaignStatusBadge status={campaignStatus} />
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
