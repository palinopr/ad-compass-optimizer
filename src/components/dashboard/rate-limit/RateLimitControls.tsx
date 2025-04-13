
import React from 'react';
import { Button } from '@/components/ui/button';

interface RateLimitControlsProps {
  isRateLimited: boolean;
  isOverridden: boolean;
  onClearRateLimit: () => void;
  onToggleOverride: () => void;
}

const RateLimitControls: React.FC<RateLimitControlsProps> = ({ 
  isRateLimited,
  isOverridden,
  onClearRateLimit,
  onToggleOverride 
}) => {
  return (
    <div className={`pt-2 grid ${isRateLimited ? 'grid-cols-2' : ''} gap-2`}>
      {isRateLimited && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearRateLimit}
          className="text-xs"
        >
          Clear Rate Limit
        </Button>
      )}
      
      <Button 
        variant={isOverridden ? "destructive" : "outline"} 
        size="sm" 
        onClick={onToggleOverride}
        className="text-xs"
      >
        {isOverridden ? "Disable Override" : "Override Limit"}
      </Button>
    </div>
  );
};

export default RateLimitControls;
