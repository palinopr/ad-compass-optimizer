
import React from 'react';
import { Database, Users, Clock, Info } from 'lucide-react';

interface RateLimitAlertProps {
  limitType: string;
  errorMessage: string | null;
}

const RateLimitAlert: React.FC<RateLimitAlertProps> = ({ limitType, errorMessage }) => {
  const getLimitIcon = () => {
    switch (limitType) {
      case 'app':
        return <Database className="h-4 w-4 mr-1" />;
      case 'user':
        return <Users className="h-4 w-4 mr-1" />;
      case 'adaccount':
        return <Database className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  const getLimitTypeText = () => {
    switch (limitType) {
      case 'app':
        return "Application Rate Limit";
      case 'user':
        return "User Rate Limit";
      case 'adaccount':
        return "Ad Account Rate Limit";
      default:
        return "API Rate Limit";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-sm border border-amber-200">
        {getLimitIcon()}
        <span className="text-sm font-medium">
          {getLimitTypeText()} active. Please wait.
        </span>
      </div>
      
      {errorMessage && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-sm border border-amber-200">
          <div className="flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimitAlert;
