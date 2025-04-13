
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RateLimitedSectionProps {
  rateLimitTimestamp: string | null;
}

const RateLimitedSection: React.FC<RateLimitedSectionProps> = ({
  rateLimitTimestamp
}) => {
  const { toast } = useToast();
  
  if (!rateLimitTimestamp) return null;
  
  // Calculate time remaining
  const limitTime = new Date(rateLimitTimestamp).getTime();
  const now = new Date().getTime();
  const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
  const remainingMinutes = Math.max(0, 5 - minutesSince);
  
  // If it's been more than 5 minutes, don't show this section
  if (minutesSince >= 5) return null;
  
  const handleClearRateLimit = () => {
    localStorage.removeItem('meta_rate_limit_timestamp');
    toast({
      title: "Rate Limit Flag Cleared",
      description: "You can now attempt to load data again",
    });
    
    // Force reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <Separator className="my-2" />
      <div className="flex items-start gap-1 mt-2">
        <Clock className="h-3 w-3 text-red-500 mt-0.5" />
        <div className="w-full">
          <p className="font-semibold text-red-600">API Rate Limit Active:</p>
          <div className="bg-red-50 p-3 border border-red-200 rounded mt-1">
            <div className="flex items-center text-red-700 mb-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="font-medium">Meta API request limit reached</span>
            </div>
            
            <p className="text-xs text-red-700 mb-2">
              Facebook's API is currently rate limiting requests from your application. 
              This typically happens when too many requests are made in a short period.
            </p>
            
            <div className="bg-white p-2 rounded border border-red-100 mb-3">
              <p className="text-sm font-medium">Estimated wait time: <span className="text-red-600">{remainingMinutes} minutes</span></p>
              <div className="h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(100, (minutesSince/5)*100)}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-xs font-medium mb-1">While you wait:</p>
            <ul className="text-xs list-disc pl-4 mb-3 space-y-0.5">
              <li>Avoid refreshing the page repeatedly</li>
              <li>Limit API calls by not switching accounts frequently</li>
              <li>Try again after the cooldown period</li>
            </ul>
            
            <div className="flex justify-between items-center">
              <span className="text-xs">
                Rate limited at {new Date(rateLimitTimestamp).toLocaleTimeString()}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 bg-white" 
                onClick={handleClearRateLimit}
              >
                Override & Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RateLimitedSection;
