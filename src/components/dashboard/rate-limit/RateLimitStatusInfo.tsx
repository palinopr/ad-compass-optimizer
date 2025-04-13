
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface RateLimitStatusInfoProps {
  isOverridden: boolean;
  onToggleOverride: () => void;
}

const RateLimitStatusInfo: React.FC<RateLimitStatusInfoProps> = ({ 
  isOverridden, 
  onToggleOverride 
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-sm border border-green-200">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          API rate limit is not active
        </span>
      </div>
      
      <div className="text-xs text-gray-600">
        <p>Meta's API has usage limits. Fetch data mindfully to avoid hitting rate limits. If you encounter a rate limit, the system will automatically queue requests and process them once the limit expires.</p>
      </div>
      
      {isOverridden && (
        <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-800">
          <span className="font-bold">Override Active:</span> Rate limit checks are currently bypassed. Only use this for development.
        </div>
      )}
    </div>
  );
};

export default RateLimitStatusInfo;
