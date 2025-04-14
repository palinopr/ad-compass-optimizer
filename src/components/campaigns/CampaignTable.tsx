
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CampaignTableRow from './CampaignTableRow';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

interface CampaignTableProps {
  campaigns: MetaCampaign[];
  status?: 'active' | 'draft' | 'archived';
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, status = 'active' }) => {
  return (
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
            <CampaignTableRow 
              key={campaign.id} 
              campaign={campaign} 
              status={status}
            />
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
};

export default CampaignTable;
