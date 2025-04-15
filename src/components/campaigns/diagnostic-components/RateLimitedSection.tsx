
import React from 'react';
import { Clock, AlertCircle, RefreshCw, TrendingDown, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getCachedCampaigns } from '@/hooks/campaigns/fetch-utils';
import { Separator } from '@/components/ui/separator';

interface RateLimitedSectionProps {
  rateLimitTimestamp: string | null;
}

const RateLimitedSection: React.FC<RateLimitedSectionProps> = ({ rateLimitTimestamp }) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [showCachedData, setShowCachedData] = React.useState<boolean>(false);
  const [rateHistory, setRateHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!rateLimitTimestamp) return;

    // Get rate limit history
    const history = JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]');
    setRateHistory(history);

    const calculateTimeLeft = () => {
      const limitTime = new Date(rateLimitTimestamp).getTime();
      const now = new Date().getTime();
      const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
      const secondsSince = Math.floor((now - limitTime) / 1000) % 60;
      
      // Rate limits typically last 10 minutes (updated from 5)
      const minutesLeft = Math.max(0, 10 - minutesSince);
      const secondsLeft = minutesLeft > 0 ? Math.max(0, 60 - secondsSince) % 60 : 0;
      
      return minutesLeft * 60 + secondsLeft;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
        
        // Trigger a fresh data load when the rate limit expires
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('campaign-data-refresh', { 
            detail: { force: true }
          }));
        }, 500);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitTimestamp]);

  // Check if we have cached data
  React.useEffect(() => {
    // Get the current selected ad account ID
    const adAccountId = localStorage.getItem('selected_ad_account') || 'default';
    const { campaigns } = getCachedCampaigns(adAccountId);
    setShowCachedData(!!campaigns && campaigns.length > 0);
  }, []);

  const handleUseCachedData = () => {
    setShowCachedData(true);
    // Dispatch event to use cached data
    window.dispatchEvent(new CustomEvent('campaign-data-refresh', { 
      detail: { useCachedData: true }
    }));
  };

  if (!rateLimitTimestamp) return null;

  // Calculate minutes and seconds for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Format the time remaining
  const timeRemaining = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Get the last rate limit usage data if available
  let usageData = null;
  try {
    const usageStr = localStorage.getItem('meta_api_last_usage');
    if (usageStr) {
      usageData = JSON.parse(usageStr);
    }
  } catch (e) {}

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        Meta API Rate Limit Detected
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Facebook has temporarily limited API requests. This typically resolves within 10 minutes.
        </p>
        {timeLeft > 0 ? (
          <p className="font-medium">
            Estimated time until limit reset: {timeRemaining}
          </p>
        ) : (
          <p className="font-medium">
            Rate limit should be reset. Try refreshing the page.
          </p>
        )}
        
        {/* Show Meta API rate limit docs */}
        <div className="text-xs">
          <a 
            href="https://developers.facebook.com/docs/graph-api/overview/rate-limiting" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-white underline"
          >
            <ExternalLink className="h-3 w-3 mr-1" /> 
            Learn about Meta API rate limits
          </a>
        </div>
        
        {/* Show usage data if available */}
        {usageData && (
          <div className="bg-red-950 bg-opacity-30 p-2 rounded text-xs mt-2">
            <div className="flex items-center mb-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span className="font-medium">Last API usage data:</span>
            </div>
            {usageData.appUsage && (
              <div className="ml-4">
                App Usage: {usageData.appUsage}
              </div>
            )}
            {usageData.businessUsage && (
              <div className="ml-4">
                Business Usage: {usageData.businessUsage}
              </div>
            )}
            {usageData.timestamp && (
              <div className="ml-4 text-gray-300 mt-1">
                Recorded: {new Date(usageData.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
        
        {/* Show rate limit history */}
        {rateHistory.length > 1 && (
          <div className="text-xs">
            <p className="font-medium">Recent rate limit events: {rateHistory.length}</p>
            <div className="text-gray-300 mt-1">
              {rateHistory.slice(-3).map((timestamp, i) => (
                <div key={i}>
                  {new Date(timestamp).toLocaleString()}
                </div>
              ))}
              {rateHistory.length > 3 && (
                <div>...and {rateHistory.length - 3} more</div>
              )}
            </div>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {showCachedData && timeLeft > 0 && (
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUseCachedData}
              className="flex items-center gap-2 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Use Cached Campaign Data
            </Button>
            <p className="text-xs mt-1 text-gray-200">
              Cached data may not reflect the most recent changes
            </p>
          </div>
        )}
        
        {/* Best practices section */}
        <div className="text-xs mt-2">
          <p className="font-medium mb-1">Meta API Rate Limit Best Practices:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Avoid making repeated API calls during rate limit periods</li>
            <li>Spread out requests evenly to avoid traffic spikes</li>
            <li>Use filters to limit data response size</li>
            <li>Consider implementing backoff strategies and caching</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default RateLimitedSection;
