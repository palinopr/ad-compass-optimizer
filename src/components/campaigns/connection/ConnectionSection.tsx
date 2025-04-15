
import React from 'react';
import ConnectionButtons from './ConnectionButtons';

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
