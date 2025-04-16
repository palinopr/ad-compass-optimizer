
import React, { useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CampaignTableRow from './CampaignTableRow';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

interface CampaignTableProps {
  campaigns: MetaCampaign[];
  status?: 'active' | 'draft' | 'archived';
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, status = 'active' }) => {
  // Log render information to help debug
  useEffect(() => {
    console.log(`[CAMPAIGN TABLE] Rendering with ${campaigns.length} campaigns`, 
      campaigns.length > 0 ? { 
        firstCampaign: {
          id: campaigns[0].id,
          name: campaigns[0].name,
          hasInsights: !!campaigns[0].insights,
          insightKeys: campaigns[0].insights ? Object.keys(campaigns[0].insights) : []
        }
      } : {}
    );
    
    // Check and log if any campaigns are missing insights
    const missingInsights = campaigns.filter(c => !c.insights || Object.keys(c.insights).length === 0);
    if (missingInsights.length > 0) {
      console.log(`[CAMPAIGN TABLE] ${missingInsights.length}/${campaigns.length} campaigns are missing insights data`);
    }
  }, [campaigns]);

  // Always render the table, even if some campaigns are missing insights
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
              key={campaign.id || Math.random().toString(36)} 
              campaign={campaign as MetaCampaign} 
              status={status}
            />
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
};

export default CampaignTable;
