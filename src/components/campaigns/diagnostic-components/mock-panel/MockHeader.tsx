
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw } from 'lucide-react';

interface MockHeaderProps {
  isMetaMockMode: boolean;
  onRefresh: () => void;
}

const MockHeader: React.FC<MockHeaderProps> = ({ isMetaMockMode, onRefresh }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-medium flex items-center">
        <Bug className="w-4 h-4 mr-2 text-amber-500" />
        {isMetaMockMode ? 'Meta API Simulation Panel' : 'Mock Diagnostic Panel'}
      </h3>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh Mock Data
      </Button>
    </div>
  );
};

export default MockHeader;
