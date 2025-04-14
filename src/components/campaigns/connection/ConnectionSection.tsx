
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power } from 'lucide-react';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';

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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshConnection}
            disabled={isAuthSyncing}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAuthSyncing ? 'animate-spin' : ''}`} />
            {isAuthSyncing ? 'Refreshing...' : 'Refresh Connection'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetConnection}
            disabled={isAuthSyncing}
            className="flex-1"
          >
            <Power className="w-4 h-4 mr-2" />
            Reset Connection
          </Button>
        </div>
      </div>
      {isAuthenticated && <AdAccountSelector />}
    </div>
  );
};

export default ConnectionSection;
