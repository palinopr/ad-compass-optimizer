
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Copy,
  Archive, 
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

interface CampaignTableRowProps {
  campaign: MetaCampaign;
  status: 'active' | 'draft' | 'archived';
}

// Helper function to map Meta API status to our status
const mapStatusToDisplay = (apiStatus: string): string => {
  switch (apiStatus) {
    case 'ACTIVE':
      return 'Active';
    case 'PAUSED':
      return 'Paused';
    case 'ARCHIVED':
      return 'Archived';
    case 'DELETED':
      return 'Deleted';
    default:
      return apiStatus;
  }
};

// Helper to format currency values
const formatCurrency = (value: string | undefined): string => {
  if (!value || value === '-') return '-';
  
  // If it's already formatted with a dollar sign, return as is
  if (value.startsWith('$')) return value;
  
  // Try to parse as a number
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '-';
  
  // Format as USD
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const CampaignTableRow: React.FC<CampaignTableRowProps> = ({ campaign, status }) => {
  // For debugging - log campaign structure if insights are missing
  React.useEffect(() => {
    if (!campaign.insights || Object.keys(campaign.insights).length === 0) {
      console.warn(`[CAMPAIGN ROW] Campaign "${campaign.name}" is missing insights data:`, campaign);
    }
  }, [campaign]);

  // Format budget value
  const getBudgetDisplay = (): string => {
    if (campaign.budget) return formatCurrency(campaign.budget);
    if (campaign.daily_budget) return formatCurrency(campaign.daily_budget) + '/day';
    if (campaign.lifetime_budget) return formatCurrency(campaign.lifetime_budget) + ' (lifetime)';
    return '-';
  };
  
  // Get spend with fallback
  const getSpendDisplay = (): string => {
    const spend = campaign.spend || campaign.insights?.spend;
    return formatCurrency(spend);
  };
  
  // Get results with fallback
  const getResultsDisplay = (): string => {
    if (campaign.results) return campaign.results;
    
    // Try to extract from insights actions
    if (campaign.insights?.actions && Array.isArray(campaign.insights.actions)) {
      const purchaseAction = campaign.insights.actions.find(
        a => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
      );
      if (purchaseAction) return purchaseAction.value;
    }
    
    return '-';
  };
  
  // Get CPA with fallback
  const getCpaDisplay = (): string => {
    if (campaign.insights?.cpa) return formatCurrency(campaign.insights.cpa);
    
    // Try to extract from cost_per_action_type
    if (campaign.insights?.cost_per_action_type && Array.isArray(campaign.insights.cost_per_action_type)) {
      const purchaseCost = campaign.insights.cost_per_action_type.find(
        c => c.action_type === 'purchase' || c.action_type === 'omni_purchase'
      );
      if (purchaseCost) return formatCurrency(purchaseCost.value);
    }
    
    return '-';
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{campaign.name}</TableCell>
      <TableCell>
        <Badge 
          variant={
            campaign.status === 'ACTIVE' ? 'default' : 
            campaign.status === 'PAUSED' ? 'outline' : 
            'secondary'
          }
        >
          {mapStatusToDisplay(campaign.status)}
        </Badge>
      </TableCell>
      <TableCell>{getBudgetDisplay()}</TableCell>
      <TableCell>{getSpendDisplay()}</TableCell>
      <TableCell>{getResultsDisplay()}</TableCell>
      <TableCell>{getCpaDisplay()}</TableCell>
      <TableCell>
        {campaign.insights?.roas && campaign.insights.roas !== '-' ? (
          <span className={parseFloat(campaign.insights.roas) >= 4 ? 'text-green-600 font-medium' : ''}>
            {campaign.insights.roas}
          </span>
        ) : '-'}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status === 'active' && (
              <>
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  <span>Pause</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
              </>
            )}
            
            {status === 'draft' && (
              <>
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  <span>Activate</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
            
            {status === 'archived' && (
              <>
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  <span>Reactivate</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Permanently</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default CampaignTableRow;
