
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface IntegrationHeaderProps {
  isAuthenticated: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
}

const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  isAuthenticated,
  isRefreshing,
  onRefresh,
  onDisconnect
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meta Integration</h1>
        <p className="text-muted-foreground">
          Manage your Meta Business accounts, pages, and API connections
        </p>
      </div>
      {isAuthenticated && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntegrationHeader;
