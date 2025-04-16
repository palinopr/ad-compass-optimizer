
import { useState } from 'react';

export const useExpandableItems = () => {
  const [openCampaigns, setOpenCampaigns] = useState<string[]>([]);
  const [openAdSets, setOpenAdSets] = useState<string[]>([]);
  
  const toggleCampaign = (campaignId: string) => {
    setOpenCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleAdSet = (adSetId: string) => {
    setOpenAdSets(prev => 
      prev.includes(adSetId)
        ? prev.filter(id => id !== adSetId)
        : [...prev, adSetId]
    );
  };
  
  return {
    openCampaigns,
    openAdSets,
    toggleCampaign,
    toggleAdSet
  };
};
