
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { checkRateLimitStatus, clearRateLimit } from '@/hooks/campaigns/fetch-utils';

const ApiRateLimitStatus: React.FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = React.useState(false);
  const [rateLimitInfo, setRateLimitInfo] = React.useState(() => checkRateLimitStatus());
  
  React.useEffect(() => {
    // Update rate limit info every 30 seconds
    const intervalId = setInterval(() => {
      setRateLimitInfo(checkRateLimitStatus());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate progress value (0-100) based on time remaining
  const getProgressValue = () => {
    if (!rateLimitInfo.isRateLimited || !rateLimitInfo.timeRemaining) return 100;
    
    // Assuming rate limit is typically 10 minutes
    const totalMinutes = 10;
    const minutesLeft = rateLimitInfo.timeRemaining;
    
    // Progress is how much time has passed
    const timeElapsedPercent = ((totalMinutes - minutesLeft) / totalMinutes) * 100;
    return Math.min(Math.max(timeElapsedPercent, 0), 100); // Ensure between 0-100
  };
  
  const handleClearRateLimit = () => {
    setIsClearing(true);
    
    try {
      // Clear the rate limit flag
      clearRateLimit();
      
      toast({
        title: "Rate Limit Flag Cleared",
        description: "The rate limit flag has been cleared. You can try fetching campaigns now.",
      });
      
      // Refresh rate limit info
      setRateLimitInfo(checkRateLimitStatus());
      
      // Wait a moment before allowing another click
      setTimeout(() => setIsClearing(false), 1000);
    } catch (e) {
      console.error("Error clearing rate limit:", e);
      setIsClearing(false);
    }
  };
  
  const handleViewCampaigns = () => {
    navigate('/campaigns');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Meta API Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rateLimitInfo.isRateLimited ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 h-4 w-4 mr-2" />
                <span className="text-sm font-medium text-red-500">Rate Limited</span>
              </div>
              <span className="text-xs text-gray-500">
                ~{rateLimitInfo.timeRemaining} min remaining
              </span>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Rate Limit Progress</span>
                <span>{Math.round(getProgressValue())}%</span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
            </div>
            
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleClearRateLimit}
                disabled={isClearing}
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Clear Rate Limit Flag
              </Button>
              
              <p className="text-xs text-gray-500">
                Meta API rate limits typically last 5-10 minutes. Clearing the flag will only work if the actual limit has expired.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm flex items-center">
              <span className="flex h-2 w-2 bg-green-500 rounded-full mr-2"></span>
              API Available
            </p>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full"
              onClick={handleViewCampaigns}
            >
              View Campaigns
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiRateLimitStatus;
