
import React from 'react';
import { Bug, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelHeaderProps {
  buildVersion: string;
  showDebug: boolean;
  onToggleDebug: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FunnelHeader: React.FC<FunnelHeaderProps> = ({
  buildVersion,
  showDebug,
  onToggleDebug,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold">Campaign Funnel</h2>
        {buildVersion && (
          <p className="text-xs text-gray-500">Build {buildVersion} - using last_28d date preset</p>
        )}
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onToggleDebug}
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          {showDebug ? "Hide Debug" : "Debug"}
        </Button>
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default FunnelHeader;
