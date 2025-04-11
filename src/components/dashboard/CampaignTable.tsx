
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Sample campaign data
const campaigns = [
  { 
    id: 1,
    name: "Summer Sale Promotion",
    status: "active",
    budget: "$500.00",
    spend: "$213.45",
    impressions: "15,432",
    clicks: "843",
    ctr: "5.46%",
    cpa: "$12.54",
    roas: "2.4x",
    health: "good"
  },
  { 
    id: 2,
    name: "New Product Launch",
    status: "active",
    budget: "$1,200.00",
    spend: "$954.30",
    impressions: "45,123",
    clicks: "2,354",
    ctr: "5.22%",
    cpa: "$10.21",
    roas: "3.1x",
    health: "good"
  },
  { 
    id: 3,
    name: "Retargeting Campaign",
    status: "active",
    budget: "$300.00",
    spend: "$287.65",
    impressions: "8,765",
    clicks: "532",
    ctr: "6.07%",
    cpa: "$8.43",
    roas: "4.2x",
    health: "good"
  },
  { 
    id: 4,
    name: "Brand Awareness",
    status: "paused",
    budget: "$700.00",
    spend: "$432.10",
    impressions: "32,543",
    clicks: "1,145",
    ctr: "3.52%",
    cpa: "$15.87",
    roas: "1.8x", 
    health: "needs-attention"
  },
  { 
    id: 5,
    name: "Holiday Special",
    status: "scheduled",
    budget: "$850.00",
    spend: "$0.00",
    impressions: "0",
    clicks: "0",
    ctr: "0%",
    cpa: "$0.00",
    roas: "0x",
    health: "not-applicable"
  }
];

const CampaignTable = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Active Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spend</TableHead>
              <TableHead>Impressions</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>CTR</TableHead>
              <TableHead>CPA</TableHead>
              <TableHead>ROAS</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map(campaign => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge variant={
                    campaign.status === "active" ? "default" : 
                    campaign.status === "paused" ? "outline" : 
                    "secondary"
                  }>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>{campaign.budget}</TableCell>
                <TableCell>{campaign.spend}</TableCell>
                <TableCell>{campaign.impressions}</TableCell>
                <TableCell>{campaign.clicks}</TableCell>
                <TableCell>{campaign.ctr}</TableCell>
                <TableCell>{campaign.cpa}</TableCell>
                <TableCell>{campaign.roas}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full mr-2",
                      campaign.health === "good" ? "bg-green-500" : 
                      campaign.health === "needs-attention" ? "bg-yellow-500" : 
                      "bg-gray-300"
                    )}></div>
                    {campaign.health === "good" ? "Good" : 
                     campaign.health === "needs-attention" ? "Needs Attention" : 
                     "N/A"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CampaignTable;
