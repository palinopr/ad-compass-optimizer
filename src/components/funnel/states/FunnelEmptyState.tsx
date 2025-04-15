
import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunnelEmptyStateProps {
  isLoading: boolean;
  error: string | null;
  lastRequestDetails: any | null;
  rawApiResponse: any | null;
  showDebug: boolean;
  onRefresh: () => void;
}

const FunnelEmptyState: React.FC<FunnelEmptyStateProps> = ({
  isLoading,
  error,
  lastRequestDetails,
  rawApiResponse,
  showDebug,
  onRefresh
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-md text-center">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
          <p>Loading campaign data...</p>
        </div>
      ) : error ? (
        <div className="text-red-500">
          <p className="font-medium">Error loading campaigns:</p>
          <p>{error}</p>
          {lastRequestDetails && (
            <div className="mt-2 text-xs bg-gray-100 rounded p-2 text-left">
              <p><strong>Last request:</strong> {lastRequestDetails.endpoint}</p>
              <p><strong>Account ID:</strong> {lastRequestDetails.accountId}</p>
              <p><strong>Token length:</strong> {lastRequestDetails.tokenLength} characters</p>
              <p><strong>Timestamp:</strong> {lastRequestDetails.timestamp}</p>
            </div>
          )}
          {showDebug && rawApiResponse && (
            <div className="mt-4 text-left">
              <p className="font-medium text-black mb-2">Raw API Response:</p>
              <div className="text-left text-xs p-2 bg-gray-100 rounded overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap">
                  {rawApiResponse.error ? 
                    JSON.stringify(rawApiResponse.error, null, 2) : 
                    rawApiResponse.text ?
                      rawApiResponse.text :
                      JSON.stringify(rawApiResponse, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>No campaigns found. Try refreshing or selecting a different account.</p>
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default FunnelEmptyState;
