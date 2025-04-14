
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockHeaderProps {
  isMetaMockMode: boolean;
  onRefresh: () => void;
}

const MockHeader: React.FC<MockHeaderProps> = ({ isMetaMockMode, onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium">
        Mock Mode Diagnostic Panel
        {isMetaMockMode && <span className="text-amber-500 ml-2">(Meta API Simulation)</span>}
      </h3>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Force UI Refresh
      </Button>
    </div>
  );
};

export default MockHeader;
