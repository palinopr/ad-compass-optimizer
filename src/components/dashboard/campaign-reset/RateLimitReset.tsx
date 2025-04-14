
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database, RotateCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const RateLimitReset: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  
  const handleClearRateLimit = () => {
    setIsResetting(true);
    
    try {
      // Clear rate limit related localStorage items
      localStorage.removeItem('meta_rate_limit_timestamp');
      localStorage.removeItem('meta_rate_limit_history');
      localStorage.removeItem('meta_api_last_usage');
      
      toast({
        title: "Rate Limit State Cleared",
        description: "All rate limit flags have been reset. Trying to refresh data...",
        duration: 3000,
      });
      
      // Force data refresh event
      window.dispatchEvent(new CustomEvent('campaign-data-refresh', { detail: { force: true, bypassRateLimit: true }}));
      
      // Reload after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      toast({
        title: "Rate Limit Reset Failed",
        description: "Unable to reset rate limit state: " + (e instanceof Error ? e.message : String(e)),
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 p-2 rounded mt-2">
      <p className="text-red-700 font-medium flex items-center">
        <Database className="h-4 w-4 mr-1" />
        Rate Limit Detected
      </p>
      <p className="text-xs text-red-600 mt-1">
        Meta API rate limiting is active. Try clearing the rate limit flag or wait a few minutes.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full border-red-300 hover:bg-red-50 text-red-700"
        onClick={handleClearRateLimit}
        disabled={isResetting}
      >
        {isResetting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RotateCw className="mr-2 h-4 w-4" />
        )}
        Clear Rate Limit Flag & Retry
      </Button>
    </div>
  );
};
