
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

const CampaignTableRow: React.FC<CampaignTableRowProps> = ({ campaign, status }) => {
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
      <TableCell>{campaign.budget}</TableCell>
      <TableCell>{campaign.spend}</TableCell>
      <TableCell>{campaign.results}</TableCell>
      <TableCell>{campaign.insights?.cpa || '-'}</TableCell>
      <TableCell>
        {campaign.insights?.roas !== '-' && campaign.insights?.roas && (
          <span className={parseFloat(campaign.insights.roas) >= 4 ? 'text-green-600 font-medium' : ''}>
            {campaign.insights.roas}
          </span>
        )}
        {(!campaign.insights?.roas || campaign.insights?.roas === '-') && '-'}
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
