
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, InfoIcon } from 'lucide-react';

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
  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };
  
  return (
    <Card className="bg-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          System Diagnostic Status
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">API Status:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Rate Limited: <span className={rateLimitStatus.isRateLimited ? "text-red-600 font-bold" : "text-green-600"}>{rateLimitStatus.isRateLimited ? "Yes" : "No"}</span></li>
              {rateLimitStatus.isRateLimited && (
                <li>Time Remaining: <span className="font-medium">{rateLimitStatus.timeRemaining} minutes</span></li>
              )}
              <li>Last Limit Hit: {formatTimestamp(rateLimitStatus.rateLimitTimestamp)}</li>
              <li>API Usage History: {localStorage.getItem('meta_rate_limit_history') ? JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]').length : '0'} events</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Campaign Data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Campaigns Count: <span className="font-medium">{campaignCount}</span></li>
              <li>Last Fetch: <span className="font-medium">{formatTimestamp(localStorage.getItem('last_campaign_fetch_attempt'))}</span></li>
              <li>Fetch Success: <span className={fetchSuccess ? "text-green-600" : "text-red-600 font-bold"}>{fetchSuccess ? "Yes" : "No"}</span></li>
              <li>Display Issues: <span className={campaignCount > 0 && fetchSuccess ? "text-red-600 font-bold" : "text-green-600"}>{campaignCount > 0 && fetchSuccess ? "Yes" : "No"}</span></li>
            </ul>
          </div>
        </div>
        <div>
          <p className="font-semibold mt-2">Debug Actions:</p>
          <div className="flex gap-2 mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => {
                // Force clear rate limit
                localStorage.removeItem('meta_rate_limit_timestamp');
                localStorage.removeItem('meta_rate_limit_history');
                window.location.reload();
              }}
            >
              Clear Rate Limit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => {
                // Log all localStorage items
                console.log('All localStorage items:');
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key) {
                    console.log(`${key}: ${localStorage.getItem(key)}`);
                  }
                }
              }}
            >
              Debug: Log Storage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => window.location.href = '/campaigns?debug=true'}
            >
              Go To Campaigns
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemDiagnosticStatus;
