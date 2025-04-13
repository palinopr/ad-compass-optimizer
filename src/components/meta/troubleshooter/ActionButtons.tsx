
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onRetry?: () => void;
  handleRefreshSession: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRetry,
  handleRefreshSession
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 justify-end">
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Loading Campaigns
        </Button>
      )}
      
      <Button 
        variant="default"
        onClick={handleRefreshSession}
        className="bg-meta-blue hover:bg-meta-dark"
      >
        Refresh Facebook Session
      </Button>
    </div>
  );
};

export default ActionButtons;
