
import React from 'react';
import { Card } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import { metaAuthService } from '@/services/MetaAuthService';
import CampaignTable from './CampaignTable';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error, refetchCampaigns } = useCampaigns(status);
  const isAuthenticated = metaAuthService.isAuthenticated();
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card>
        <ErrorState 
          error={error} 
          isAuthenticated={isAuthenticated} 
          onRetry={refetchCampaigns}
        />
      </Card>
    );
  }
  
  // Handle empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <EmptyState status={status} />
      </Card>
    );
  }
  
  // Handle data state
  return (
    <Card>
      <CampaignTable campaigns={campaigns} status={status} />
    </Card>
  );
};

export default CampaignList;
