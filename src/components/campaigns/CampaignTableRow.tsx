
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
  // For debugging - log campaign structure if insights are missing
  React.useEffect(() => {
    if (!campaign.insights || Object.keys(campaign.insights).length === 0) {
      console.warn(`[CAMPAIGN ROW] Campaign "${campaign.name}" is missing insights data:`, campaign);
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
          spend={campaign.spend}
          results={campaign.results}
          insights={campaign.insights}
        />
      </TableCell>
      <TableCell className="text-right">
        <CampaignActions status={status} />
      </TableCell>
    </TableRow>
  );
};

export default CampaignTableRow;
