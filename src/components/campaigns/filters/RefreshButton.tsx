
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const RefreshButton = ({ onClick, isLoading }: RefreshButtonProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={isLoading}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  );
};

export default RefreshButton;
