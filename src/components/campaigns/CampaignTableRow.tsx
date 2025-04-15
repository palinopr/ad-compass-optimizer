import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
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
  // Log detailed campaign data at render time for debugging
  React.useEffect(() => {
    // Basic validation check
    if (!campaign.id || !campaign.name) {
      console.warn(`[CAMPAIGN ROW] Invalid campaign data:`, campaign);
      return;
    }

    // Only log when insights data is missing
    if (!campaign.insights || Object.keys(campaign.insights).length === 0) {
      console.warn(`[CAMPAIGN ROW] Campaign "${campaign.name}" (${campaign.id}) is missing insights data`);
      
      // Trigger state update notification to help debug UI rendering issues
      localStorage.setItem('campaign_insight_missing', JSON.stringify({
        campaignId: campaign.id,
        campaignName: campaign.name,
        timestamp: new Date().toISOString()
      }));
    } else {
      // Log existing insights for tracking
      console.log(`[CAMPAIGN ROW] Campaign "${campaign.name}" (${campaign.id}) insights data:`, {
        spend: campaign.insights.spend || 'missing',
        clicks: campaign.insights.clicks || 'missing',
        impressions: campaign.insights.impressions || 'missing',
        cpa: campaign.insights.cpa || 'missing',
        roas: campaign.insights.roas || 'missing',
        hasExtraStats: !!campaign.extraStats,
        hasValidData: (
          (campaign.insights.spend && campaign.insights.spend !== '-') || 
          (campaign.insights.cpa && campaign.insights.cpa !== '-') || 
          (campaign.insights.roas && campaign.insights.roas !== '-')
        )
      });
      
      // Mark that we have valid insights data (used for synchronization checks)
      if ((campaign.insights.spend && campaign.insights.spend !== '-') || 
          (campaign.insights.cpa && campaign.insights.cpa !== '-') || 
          (campaign.insights.roas && campaign.insights.roas !== '-')) {
        localStorage.setItem('has_valid_campaign_insights', 'true');
      }
    }
  }, [campaign]);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {campaign.name}
          {campaign.loadedFromFallback && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Partial Data: Limited campaign information available</p>
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
        />
      </TableCell>
      <TableCell className="text-right">
        <CampaignActions status={status} />
      </TableCell>
    </TableRow>
  );
};

export default CampaignTableRow;
