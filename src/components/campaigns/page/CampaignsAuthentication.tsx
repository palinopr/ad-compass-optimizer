
import React from 'react';
import ConnectionStatusAlerts from '@/components/campaigns/ConnectionStatusAlerts';
import ConnectionSection from '@/components/campaigns/connection/ConnectionSection';
import AdAccountSection from '@/components/meta/integration/AdAccountSection';

interface CampaignsAuthenticationProps {
  isAuthenticated: boolean;
  hasPermissions: boolean;
  hasAdAccount: boolean;
  isAuthSyncing: boolean;
  refreshConnection: () => void;
  resetConnection: () => void;
  showConnectionDialog?: boolean;
  setShowConnectionDialog?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CampaignsAuthentication: React.FC<CampaignsAuthenticationProps> = ({
  isAuthenticated,
  hasPermissions,
  hasAdAccount,
  isAuthSyncing,
  refreshConnection,
  resetConnection,
  showConnectionDialog,
  setShowConnectionDialog
}) => {
  return (
    <>
      <ConnectionStatusAlerts 
        isAuthenticated={isAuthenticated} 
        hasPermissions={hasPermissions} 
        hasAdAccount={hasAdAccount}
      />
    
      <ConnectionSection 
        isAuthenticated={isAuthenticated}
        isAuthSyncing={isAuthSyncing}
        refreshConnection={refreshConnection}
        resetConnection={resetConnection}
      />
      
      {isAuthenticated && <AdAccountSection isAuthenticated={isAuthenticated} />}
    </>
  );
};

export default CampaignsAuthentication;
