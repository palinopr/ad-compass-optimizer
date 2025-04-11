
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
  Trash2,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCampaigns } from '@/hooks/useCampaigns';
import { metaAuthService } from '@/services/MetaAuthService';

interface CampaignListProps {
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

// Helper function to format date
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Helper function to calculate days remaining
const calculateDaysRemaining = (endDate: string | null): number => {
  if (!endDate) return 0;
  
  const end = new Date(endDate);
  const now = new Date();
  
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error } = useCampaigns(status);
  const isAuthenticated = metaAuthService.isAuthenticated();
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-meta-blue animate-spin mb-2" />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-muted-foreground mb-4">
            {!isAuthenticated ? 
              "Please connect your Meta account to view campaigns." : 
              "Please check your permissions or select an ad account."}
          </p>
          {!isAuthenticated && (
            <Button className="bg-meta-blue hover:bg-meta-dark">
              Connect Meta Account
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Handle empty state
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CampaignList;
