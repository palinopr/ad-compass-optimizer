
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RateLimitCountdownProps {
  remainingTime: number | null;
  remainingPercent: number;
}

const RateLimitCountdown: React.FC<RateLimitCountdownProps> = ({ 
  remainingTime, 
  remainingPercent 
}) => {
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Time remaining until API access resumes:</span>
        <span className="font-medium">{remainingTime ? formatTimeRemaining(remainingTime) : 'Unknown'}</span>
      </div>
      <Progress value={remainingPercent} className="h-1.5" />
    </div>
  );
};

export default RateLimitCountdown;
