
import React from 'react';
import { CircleX, AlertCircle, FileX, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CampaignLoadingTroubleshooter from '@/components/meta/CampaignLoadingTroubleshooter';
import { Link } from 'react-router-dom';

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-12 text-gray-500">
    <div className="animate-spin mb-4">
      <RefreshCw size={24} />
    </div>
    <p>Loading campaigns...</p>
  </div>
);

export const ErrorState = ({ 
  error, 
  isAuthenticated, 
  onRetry, 
  errorDetails 
}: { 
  error: string;
  isAuthenticated: boolean;
  onRetry: () => void;
  errorDetails?: any;
}) => {
  return (
    <div className="p-6">
      <CampaignLoadingTroubleshooter
        errorDetails={errorDetails}
        onRetry={onRetry}
      />
    </div>
  );
};

export const EmptyState = ({ status }: { status: string }) => {
  // Get ad account info if available
  const adAccountId = localStorage.getItem('selected_ad_account');
  const lastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  
  // Determine if this is a "no campaigns" scenario or a general empty state
  const isNoCampaignsScenario = adAccountId && lastFetchSuccess;
  
  // Different messages based on campaign type
  const getStatusMessage = () => {
    switch (status) {
      case 'active':
        return "You don't have any active campaigns";
      case 'draft':
        return "You don't have any draft campaigns";
      case 'archived':
        return "You don't have any archived campaigns";
      default:
        return "No campaigns found";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {isNoCampaignsScenario ? (
        <>
          <div className="bg-amber-50 rounded-full p-3 mb-4">
            <FileX size={24} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Campaigns in This Account</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Ad account <span className="font-mono text-sm bg-gray-100 px-1 rounded">{adAccountId}</span> doesn't have any {status} campaigns.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              asChild
            >
              <Link to="/meta-integration">
                <RefreshCw className="h-4 w-4" />
                Select Different Account
              </Link>
            </Button>
            
            <Button 
              className="flex items-center gap-2" 
              asChild
            >
              <a 
                href={`https://business.facebook.com/adsmanager/create?act=${adAccountId}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Plus className="h-4 w-4" />
                Create Campaign in Meta
              </a>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-100 rounded-full p-3 mb-4">
            <CircleX size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">{getStatusMessage()}</h3>
          <p className="text-gray-500 text-center mb-6">
            Try selecting a different status filter or connect an ad account with campaigns.
          </p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            asChild
          >
            <Link to="/meta-integration">
              Go to Account Settings
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};
