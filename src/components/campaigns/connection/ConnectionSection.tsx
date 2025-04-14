
import React from 'react';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
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
  resetConnection
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="flex flex-col space-y-2">
        <MetaConnect />
        <ConnectionButtons 
          isAuthSyncing={isAuthSyncing}
          refreshConnection={refreshConnection}
          resetConnection={resetConnection}
        />
      </div>
      {isAuthenticated && <AdAccountSelector />}
    </div>
  );
};

export default ConnectionSection;
