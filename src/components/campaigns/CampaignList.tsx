
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

// Sample campaign data - would come from API in real app
const sampleCampaigns = {
  active: [
    {
      id: 'camp-1',
      name: 'Summer Festival Tickets',
      event: 'Summer Festival 2025',
      status: 'Active',
      budget: '$50/day',
      spent: '$350',
      results: '128 tickets',
      cpa: '$2.73',
      roas: '4.2x',
      daysRemaining: 12
    },
    {
      id: 'camp-2',
      name: 'Tech Conference Early Birds',
      event: 'Tech Conference 2025',
      status: 'Active',
      budget: '$75/day',
      spent: '$525',
      results: '95 tickets',
      cpa: '$5.53',
      roas: '3.7x',
      daysRemaining: 18
    }
  ],
  draft: [
    {
      id: 'camp-draft-1',
      name: 'Music Concert Promotion',
      event: 'Music Concert 2025',
      status: 'Draft',
      budget: '$40/day',
      spent: '$0',
      results: '0 tickets',
      cpa: '-',
      roas: '-',
      daysRemaining: 0
    }
  ],
  archived: [
    {
      id: 'camp-arch-1',
      name: 'Art Exhibition Presale',
      event: 'Art Exhibition 2025',
      status: 'Completed',
      budget: '$30/day',
      spent: '$600',
      results: '212 tickets',
      cpa: '$2.83',
      roas: '5.1x',
      daysRemaining: 0
    }
  ]
};

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const campaigns = sampleCampaigns[status] || [];
  
  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No {status} campaigns found.</p>
          {status === 'draft' && (
            <Button className="bg-meta-blue hover:bg-meta-dark">
              Create New Campaign
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Event</TableHead>
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
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.event}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      campaign.status === 'Active' ? 'default' : 
                      campaign.status === 'Draft' ? 'outline' : 
                      campaign.status === 'Completed' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.budget}</TableCell>
                <TableCell>{campaign.spent}</TableCell>
                <TableCell>{campaign.results}</TableCell>
                <TableCell>{campaign.cpa}</TableCell>
                <TableCell>
                  {campaign.roas !== '-' && (
                    <span className={parseFloat(campaign.roas) >= 4 ? 'text-green-600 font-medium' : ''}>
                      {campaign.roas}
                    </span>
                  )}
                  {campaign.roas === '-' && '-'}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CampaignList;
