
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Database, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RateLimitedSection from '../RateLimitedSection';
import ApiTestPanel from '../ApiTestPanel';

interface DataTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const DataTab: React.FC<DataTabProps> = ({ diagnosticResults }) => {
  // Get the most recent rate limit timestamp
  const rateLimitTimestamp = localStorage.getItem('meta_rate_limit_timestamp');
  
  // Check if cached campaigns are available
  const [hasCachedData, setHasCachedData] = React.useState(false);
  const [cachedDataAge, setCachedDataAge] = React.useState<string>('unknown');
  
  React.useEffect(() => {
    const cachedCampaignsJson = localStorage.getItem('cached_campaigns');
    if (cachedCampaignsJson) {
      try {
        const cachedData = JSON.parse(cachedCampaignsJson);
        setHasCachedData(true);
        
        if (cachedData.timestamp) {
          const cacheTime = new Date(cachedData.timestamp);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - cacheTime.getTime()) / (1000 * 60));
          
          if (diffMinutes < 60) {
            setCachedDataAge(`${diffMinutes} minutes ago`);
          } else if (diffMinutes < 1440) {
            setCachedDataAge(`${Math.floor(diffMinutes / 60)} hours ago`);
          } else {
            setCachedDataAge(`${Math.floor(diffMinutes / 1440)} days ago`);
          }
        }
      } catch (e) {
        console.error('Error parsing cached campaigns:', e);
      }
    }
  }, []);
  
  // Get last fetch details
  const lastFetchAttempt = localStorage.getItem('last_campaign_fetch_attempt');
  const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  const fetchErrorRaw = localStorage.getItem('last_campaign_fetch_error');
  let fetchError = null;
  
  if (fetchErrorRaw) {
    try {
      fetchError = JSON.parse(fetchErrorRaw);
    } catch (e) {
      console.error('Error parsing fetch error:', e);
    }
  }
  
  // Format fetch timestamp
  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid timestamp';
    }
  };

  // Handle using cached data
  const handleUseCachedData = () => {
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { 
      detail: { useCachedData: true }
    }));
  };
  
  // Handle clearing cache and refreshing
  const handleClearCacheAndRefresh = () => {
    localStorage.removeItem('cached_campaigns');
    localStorage.removeItem('meta_rate_limit_timestamp');
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { 
      detail: { force: true }
    }));
  };

  return (
    <div className="space-y-4">
      {/* Direct API Test panel - for immediate verification */}
      <ApiTestPanel />
      
      {/* Rate limit warning section */}
      <RateLimitedSection rateLimitTimestamp={rateLimitTimestamp} />
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Campaign Data Status
          </h3>
          
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Last fetch attempt:</span>
              <span className="font-medium">{formatTimestamp(lastFetchAttempt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fetch status:</span>
              <span className={`font-medium ${lastFetchSuccess ? 'text-green-600' : 'text-red-500'}`}>
                {lastFetchSuccess ? 'Success' : 'Failed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Campaign count:</span>
              <span className="font-medium">{campaignCount}</span>
            </div>
            
            {fetchError && !lastFetchSuccess && (
              <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs">
                <div className="font-medium text-red-700 mb-1">Error details:</div>
                <div className="text-red-600 break-all">{fetchError.message}</div>
              </div>
            )}
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                API Call Management
              </h4>
              
              <p className="text-xs text-gray-600">
                The Meta API has rate limits to prevent spam. Excessive calls may trigger temporary limits.
              </p>
              
              {hasCachedData && (
                <div className="bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Cached data available</span>
                    <span className="text-xs text-blue-600">From {cachedDataAge}</span>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1"
                      onClick={handleUseCachedData}
                    >
                      Use Cached Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex-1"
                      onClick={handleClearCacheAndRefresh}
                    >
                      Clear Cache & Refresh
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="bg-amber-50 p-2 rounded border border-amber-100">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-800">Rate Limiting Prevention Tips</h5>
                    <ul className="text-xs text-amber-700 list-disc pl-4 mt-1 space-y-1">
                      <li>Avoid refreshing the page repeatedly</li>
                      <li>Wait 5-10 minutes between API fetch attempts</li>
                      <li>Use cached data when available</li>
                      <li>Limit unnecessary campaign data requests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataTab;
