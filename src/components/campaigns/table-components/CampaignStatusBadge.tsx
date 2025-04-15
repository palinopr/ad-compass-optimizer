
import React from 'react';
import { Badge } from '@/components/ui/badge';

// Helper function for status mapping
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

interface CampaignStatusBadgeProps {
  status: string;
}

const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ status }) => {
  return (
    <Badge 
      variant={
        status === 'ACTIVE' ? 'default' : 
        status === 'PAUSED' ? 'outline' : 
        'secondary'
      }
    >
      {mapStatusToDisplay(status)}
    </Badge>
  );
};

export default CampaignStatusBadge;
