
import React, { useEffect, useState } from 'react';
import CampaignCreationWizard from './CampaignCreationWizard';

interface CampaignCreationTriggerProps {
  onClick?: () => void;
  isAuthenticated?: boolean;
  hasAdAccount?: boolean;
  hasPermissions?: boolean;
}

const CampaignCreationTrigger: React.FC<CampaignCreationTriggerProps> = () => {
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
    <CampaignCreationWizard 
      onClose={() => setShowCreateWizard(false)}
      onSuccess={() => setShowCreateWizard(false)}
    />
  );
};

export default CampaignCreationTrigger;
