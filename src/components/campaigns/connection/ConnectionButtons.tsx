
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power } from 'lucide-react';

interface ConnectionButtonsProps {
  isAuthenticated: boolean;
  isAuthSyncing: boolean;
  refreshConnection: () => void;
  resetConnection: () => void;
}

const ConnectionButtons: React.FC<ConnectionButtonsProps> = ({
  isAuthenticated,
  isAuthSyncing,
  refreshConnection,
  resetConnection
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshConnection}
        disabled={isAuthSyncing || !isAuthenticated}
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
  );
};

export default ConnectionButtons;
