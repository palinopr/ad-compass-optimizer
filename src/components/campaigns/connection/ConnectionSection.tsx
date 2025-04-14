
import React from 'react';
import ConnectionButtons from './ConnectionButtons';
import CampaignConnectionStatus from './CampaignConnectionStatus';

interface ConnectionSectionProps {
  isAuthenticated: boolean;
  isAuthSyncing: boolean;
  refreshConnection: () => void;
  resetConnection: () => void;
}

const ConnectionSection: React.FC<ConnectionSectionProps> = ({
  isAuthenticated,
  isAuthSyncing,
  refreshConnection,
  resetConnection,
}) => {
  return (
    <div className="space-y-4">
      <CampaignConnectionStatus />
      <ConnectionButtons
        isAuthenticated={isAuthenticated}
        isAuthSyncing={isAuthSyncing}
        refreshConnection={refreshConnection}
        resetConnection={resetConnection}
      />
    </div>
  );
};

export default ConnectionSection;
