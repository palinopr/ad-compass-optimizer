
import React from 'react';
import { RefreshCw, ExternalLink, Shield, Globe, AlertCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TroubleshootingSectionProps {
  tokenAnalysis?: any;
  hasDataInconsistency: boolean;
  hasUIDisplayIssue: boolean;
  campaignCount: number;
  fetchError: string | null;
  handleForceReload: () => void;
  handleHardReset: () => void;
  handleFullPageRefresh: () => void;
}

const TroubleshootingSection: React.FC<TroubleshootingSectionProps> = ({
  tokenAnalysis,
  hasDataInconsistency,
  hasUIDisplayIssue,
  campaignCount,
  fetchError,
  handleForceReload,
  handleHardReset,
  handleFullPageRefresh
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
      <Collapsible>
        <CollapsibleTrigger className="flex items-center w-full justify-between text-sm font-semibold py-1">
          <span>Advanced Troubleshooting</span>
          <RefreshCw className="h-3 w-3" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-3">
            {hasRateLimit && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded">
                <p className="text-amber-700 font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Meta API Rate Limit Issue
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  The Facebook API is currently limiting requests from your application.
                </p>
                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                  <li>This is a temporary restriction that typically lasts 5-15 minutes</li>
                  <li>Avoid repeated refresh attempts which can extend the limit</li>
                  <li>Wait a few minutes before trying again</li>
                </ul>
              </div>
            )}
          
            {tokenAnalysis?.cors?.hasCorsIssues && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded">
                <p className="text-amber-700 font-medium">CORS Issues Detected</p>
                <p className="text-xs text-amber-600 mt-1">
                  Browser security is preventing direct API calls. This can cause data loading issues even with valid authentication.
                </p>
                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                  <li>Try using a different browser (Firefox often works better)</li>
                  <li>Disable browser extensions that might block requests</li>
                  <li>Use Firefox or Edge instead of Chrome</li>
                </ul>
              </div>
            )}
            
            {(hasDataInconsistency || hasUIDisplayIssue) && (
              <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                <p className="text-blue-700 font-medium">UI/Data Inconsistency</p>
                <p className="text-xs text-blue-600 mt-1">
                  Data is loading from the API ({campaignCount} campaigns) but may not be displaying in the UI.
                </p>
                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                  <li>Try the "Force UI Refresh" option below</li>
                  <li>Check your browser console (F12) for JavaScript errors</li>
                  <li>Try with a different browser</li>
                  <li>Clear your browser cache completely</li>
                </ul>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <a 
                href="https://developers.facebook.com/tools/debug/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Meta Debug Tools
              </a>
              
              <div className="flex flex-wrap gap-2 mt-1">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="text-xs h-7" 
                  onClick={handleForceReload}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Force Reload Page
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7" 
                  onClick={handleHardReset}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Hard Reset Auth
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="text-xs h-7" 
                  onClick={handleFullPageRefresh}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Force UI Refresh
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              If you're still having issues, try opening your browser's developer console (F12) and check for network errors when loading campaigns.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export default TroubleshootingSection;
