
import React from 'react';
import { Card } from '@/components/ui/card';
import { LoadingState } from '../CampaignListStates';

export const LoadingView = () => {
  return (
    <Card>
      <LoadingState />
    </Card>
  );
};

export default LoadingView;
