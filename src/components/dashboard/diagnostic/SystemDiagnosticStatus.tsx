
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SystemDiagnosticStatusProps {
  rateLimitStatus: {
    isRateLimited: boolean;
    timeRemaining: number | null;
    rateLimitTimestamp: string | null;
  };
  campaignCount: number;
  fetchSuccess: boolean;
}

const SystemDiagnosticStatus: React.FC<SystemDiagnosticStatusProps> = ({
  rateLimitStatus,
  campaignCount,
  fetchSuccess
}) => {
  const handleForceRefresh = () => {
    // Clear any cached data
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    localStorage.removeItem('display_issue_detected');
    
    // Force both display refresh and data refresh events
    window.dispatchEvent(new CustomEvent('campaign-display-refresh', { detail: { force: true }}));
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { detail: { force: true }}));
    
    toast({
      title: "Refresh Triggered",
      description: "Refreshing campaign data and UI...",
    });
  };
  
  const handleClearRateLimit = () => {
    localStorage.removeItem('meta_rate_limit_timestamp');
    localStorage.removeItem('meta_rate_limit_history');
    
    toast({
      title: "Rate Limit Flag Cleared",
      description: "The rate limit status has been reset. Refreshing data...",
    });
    
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { detail: { force: true }}));
  };
  
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {fetchSuccess ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 text-amber-500" />
            )}
            <span>Data Fetching</span>
          </div>
          <span className="text-gray-600">{campaignCount} campaigns loaded</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {rateLimitStatus.isRateLimited ? (
              <AlertCircle className="h-3 w-3 text-red-500" />
            ) : (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
            <span>API Rate Limit</span>
          </div>
          {rateLimitStatus.isRateLimited ? (
            <span className="text-red-600">Limited ({rateLimitStatus.timeRemaining} min)</span>
          ) : (
            <span className="text-green-600">OK</span>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-200 flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex-1" 
            onClick={handleForceRefresh}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Force Refresh
          </Button>
          
          {rateLimitStatus.isRateLimited && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs flex-1 border-red-300 text-red-600" 
              onClick={handleClearRateLimit}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Clear Rate Limit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnosticStatus;
