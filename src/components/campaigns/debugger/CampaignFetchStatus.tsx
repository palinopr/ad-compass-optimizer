
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignFetchStatusProps {
  campaigns: any[];
  isLoading: boolean;
  error: string | null;
}

const CampaignFetchStatus: React.FC<CampaignFetchStatusProps> = ({ 
  campaigns, 
  isLoading, 
  error 
}) => {
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [lastFetchAccountId, setLastFetchAccountId] = useState<string | null>(null);
  
  useEffect(() => {
    // Load fetch history from local storage
    const storedFetchTime = localStorage.getItem('last_campaign_fetch_attempt');
    if (storedFetchTime) {
      setLastFetchTime(storedFetchTime);
    }
    
    const storedAccount = localStorage.getItem('last_campaign_fetch_account');
    if (storedAccount) {
      setLastFetchAccountId(storedAccount);
    }
    
    // Listen for campaign fetch events
    const handleFetchAttempt = (event: CustomEvent<{accountId?: string}>) => {
      setFetchAttempts(prev => prev + 1);
      setLastFetchTime(new Date().toISOString());
      
      if (event.detail?.accountId) {
        setLastFetchAccountId(event.detail.accountId);
      }
    };
    
    window.addEventListener('campaign-fetch-log', handleFetchAttempt as EventListener);
    window.addEventListener('campaign-fetch-attempt', handleFetchAttempt as EventListener);
    
    return () => {
      window.removeEventListener('campaign-fetch-log', handleFetchAttempt as EventListener);
      window.removeEventListener('campaign-fetch-attempt', handleFetchAttempt as EventListener);
    };
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-4 h-4 mr-2 text-blue-600" />
            Campaign Fetch Status
          </div>
          <StatusBadge isLoading={isLoading} error={error} campaigns={campaigns} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Campaigns:</span>
            <span className="text-sm font-mono">{campaigns.length}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Fetch attempts:</span>
            <span className="text-sm font-mono">{fetchAttempts}</span>
          </div>
          
          {lastFetchAccountId && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last account:</span>
              <span className="text-sm font-mono truncate max-w-[150px]">act_{lastFetchAccountId}</span>
            </div>
          )}
          
          {lastFetchTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last attempt:</span>
              <span className="text-sm">{formatTime(lastFetchTime)}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-xs mt-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Fetching campaigns...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ isLoading, error, campaigns }: { 
  isLoading: boolean;
  error: string | null;
  campaigns: any[];
}) => {
  if (isLoading) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Loading...
      </Badge>
    );
  }
  
  if (error) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        Failed
      </Badge>
    );
  }
  
  if (campaigns.length > 0) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Loaded ({campaigns.length})
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
      Empty
    </Badge>
  );
};

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } catch (e) {
    return 'Invalid time';
  }
};

export default CampaignFetchStatus;
