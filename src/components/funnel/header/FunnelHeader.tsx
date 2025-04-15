
import React from 'react';
import { RefreshCw, Code, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FunnelHeaderProps {
  buildVersion: string;
  showDebug: boolean;
  onToggleDebug: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  datePreset?: string;
}

const FunnelHeader = ({ 
  buildVersion, 
  showDebug, 
  onToggleDebug, 
  onRefresh, 
  isLoading,
  datePreset = 'last_28d'
}: FunnelHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
      <div>
        <h2 className="text-2xl font-bold">Campaign Funnel View</h2>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            Build: {buildVersion}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-green-100">
            Date Preset: {datePreset}
          </Badge>
        </div>
      </div>
      <div className="flex flex-shrink-0 space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleDebug}
        >
          {showDebug ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              Hide Debug
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-1" />
              Show Debug
            </>
          )}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
};

export default FunnelHeader;
