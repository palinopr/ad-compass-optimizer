
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const RefreshButton = ({ onClick, isLoading }: RefreshButtonProps) => {
  const [cooldown, setCooldown] = useState(0);
  
  // Handle cooldown timer when button is clicked
  const handleClick = () => {
    onClick();
    setCooldown(10); // 10 second cooldown
  };
  
  // Countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [cooldown]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClick}
            disabled={isLoading || cooldown > 0}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {cooldown > 0 ? `Available in ${cooldown}s` : 'Refresh campaigns'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
