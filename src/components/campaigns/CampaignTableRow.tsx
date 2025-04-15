
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import CampaignStatusBadge from './table-components/CampaignStatusBadge';
import CampaignMetrics from './table-components/CampaignMetrics';
import CampaignActions from './table-components/CampaignActions';

interface CampaignTableRowProps {
  campaign: MetaCampaign;
  status: 'active' | 'draft' | 'archived';
}

const CampaignTableRow: React.FC<CampaignTableRowProps> = ({ campaign, status }) => {
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
        hasExtraStats: !!campaign.extraStats
      });
      
      // Mark that we have valid insights data (used for synchronization checks)
      localStorage.setItem('has_valid_campaign_insights', 'true');
    }
  }, [campaign]);

  return (
    <TableRow>
      <TableCell className="font-medium">{campaign.name}</TableCell>
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
