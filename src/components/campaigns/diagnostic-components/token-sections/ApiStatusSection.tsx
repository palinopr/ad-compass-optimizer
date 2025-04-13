
import React from 'react';
import { Globe, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ApiStatusSectionProps {
  lastFetchAttempt: string | null;
  lastFetchSuccess: boolean;
  fetchError: string | null;
  formattedFetchTime: string;
  tokenAnalysis?: any;
}

const ApiStatusSection: React.FC<ApiStatusSectionProps> = ({
  lastFetchAttempt,
  lastFetchSuccess,
  fetchError,
  formattedFetchTime,
  tokenAnalysis
}) => {
  // Check for rate limit error
  const hasRateLimit = fetchError && 
    (fetchError.includes('rate limit') || 
     fetchError.includes('request limit') || 
     fetchError.includes('code 4') ||
     fetchError.includes('code:4'));

  return (
    <>
      <Separator className="my-2" />
      <div className="flex items-start gap-1 mt-2">
        <Globe className="h-3 w-3 text-blue-500 mt-0.5" />
        <div>
          <p className="font-semibold">API Status:</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="mr-1">Last check:</span>
              <span className="bg-gray-100 px-1 rounded">{formattedFetchTime}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">Success:</span>
              {lastFetchSuccess ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" /> Yes
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" /> No
                </span>
              )}
            </div>
            
            {hasRateLimit && (
              <div className="bg-amber-50 text-amber-800 text-xs p-2 border border-amber-200 rounded mt-1">
                <div className="flex items-center font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  Meta API Rate Limit Detected
                </div>
                <p className="mt-1">
                  Facebook is temporarily limiting API requests. This typically resolves within 5-15 minutes.
                </p>
                <div className="mt-2 text-xs">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Wait a few minutes before trying again</li>
                    <li>Reduce the frequency of API requests</li>
                    <li>Try again later when API limits reset</li>
                  </ul>
                </div>
              </div>
            )}

            {!hasRateLimit && !lastFetchSuccess && fetchError && (
              <div className="text-red-600 text-xs break-all">
                <p className="font-medium">Error:</p>
                <p className="bg-red-50 p-1 rounded border border-red-100">{fetchError}</p>
              </div>
            )}
            
            {tokenAnalysis && tokenAnalysis.issues && tokenAnalysis.issues.length > 0 && (
              <div className="text-amber-600 text-xs mt-1">
                <p className="font-medium">Issues:</p>
                {tokenAnalysis.issues.map((issue: string, i: number) => (
                  <p key={i} className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{issue}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApiStatusSection;
