
import React from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

interface CampaignDebugInfoProps {
  campaigns: MetaCampaign[];
}

const CampaignDebugInfo = ({ campaigns }: CampaignDebugInfoProps) => {
  if (process.env.NODE_ENV === 'production') return null;

  return campaigns.length > 0 ? (
    <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
      <p>Debug: {campaigns.length} campaigns loaded. First campaign ID: {campaigns[0]?.id || 'unknown'}</p>
    </div>
  ) : null;
};

export default CampaignDebugInfo;
