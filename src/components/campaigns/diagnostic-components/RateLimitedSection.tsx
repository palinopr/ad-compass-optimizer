
import React from 'react';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getCachedCampaigns } from '@/hooks/campaigns/fetch-utils';

interface RateLimitedSectionProps {
  rateLimitTimestamp: string | null;
}

const RateLimitedSection: React.FC<RateLimitedSectionProps> = ({ rateLimitTimestamp }) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [showCachedData, setShowCachedData] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!rateLimitTimestamp) return;

    const calculateTimeLeft = () => {
      const limitTime = new Date(rateLimitTimestamp).getTime();
      const now = new Date().getTime();
      const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
      const secondsSince = Math.floor((now - limitTime) / 1000) % 60;
      
      // Rate limits typically last 5 minutes
      const minutesLeft = Math.max(0, 5 - minutesSince);
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
    const { campaigns } = getCachedCampaigns();
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

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        Meta API Rate Limit Detected
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Facebook has temporarily limited API requests. This typically resolves within 5 minutes.
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
        
        {showCachedData && timeLeft > 0 && (
          <div className="mt-3">
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
      </AlertDescription>
    </Alert>
  );
};

export default RateLimitedSection;
