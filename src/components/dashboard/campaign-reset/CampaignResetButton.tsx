
import React from 'react';
import { StandardReset } from './StandardReset';
import { DeepReset } from './DeepReset';
import { RateLimitReset } from './RateLimitReset';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const CampaignResetButton = () => {
  // Check if we have a data/UI inconsistency
  const campaignCount = parseInt(localStorage.getItem('last_campaign_count') || '0');
  const fetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const hasDataButNotShowing = campaignCount > 0 && fetchSuccess;
  
  // Check if we're currently rate limited
  const isRateLimited = !!localStorage.getItem('meta_rate_limit_timestamp');

  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Campaign Display Issues Detected</AlertTitle>
      <AlertDescription className="space-y-3 text-amber-700">
        <p>
          {hasDataButNotShowing 
            ? `Data has loaded successfully (${campaignCount} campaigns found) but is not displaying correctly in the UI.` 
            : "If your campaigns aren't displaying even though data has loaded successfully, you may need to reset the application state to fix UI rendering issues."}
        </p>
        
        {isRateLimited && <RateLimitReset />}
        
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <StandardReset />
          <DeepReset />
        </div>
        
        {hasDataButNotShowing && (
          <div className="text-xs bg-amber-100 p-2 rounded mt-2">
            <strong>Note:</strong> The diagnostic shows {campaignCount} campaigns were successfully loaded from the API, 
            but they're not displaying in the UI. This typically indicates a React component rendering issue.
            Try the Deep System Reset for a complete rebuild of the application state.
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default CampaignResetButton;
