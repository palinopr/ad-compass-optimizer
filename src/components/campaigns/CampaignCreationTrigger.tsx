
import React, { useEffect, useState } from 'react';
import CampaignCreationWizard from './CampaignCreationWizard';

const CampaignCreationTrigger: React.FC = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  useEffect(() => {
    // Event listener to show the campaign creation wizard
    const handleShowCreationWizard = () => {
      console.log('Campaign creation wizard triggered');
      setShowCreateWizard(true);
    };
    
    window.addEventListener('show-campaign-creation', handleShowCreationWizard);
    
    return () => {
      window.removeEventListener('show-campaign-creation', handleShowCreationWizard);
    };
  }, []);
  
  if (!showCreateWizard) return null;
  
  return (
    <CampaignCreationWizard onCancel={() => setShowCreateWizard(false)} />
  );
};

export default CampaignCreationTrigger;
