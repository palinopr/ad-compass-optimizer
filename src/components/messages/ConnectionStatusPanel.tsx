import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Link, Link2Off, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { metaAuthService } from '@/services/MetaAuthService';
import { Button } from '@/components/ui/button';

interface ConnectionStatusPanelProps {
  isAuthenticated: boolean;
  adAccounts: any[];
  onRetryConnection?: () => void;
}

const ConnectionStatusPanel: React.FC<ConnectionStatusPanelProps> = ({ 
  isAuthenticated, 
  adAccounts,
  onRetryConnection
}) => {
  // Get token freshness information
  const tokenInfo = isAuthenticated ? metaAuthService.checkTokenFreshness() : { isFresh: false, age: 0 };
  
  // Get permission information
  const hasAdPermissions = isAuthenticated ? metaAuthService.hasAdAccountPermissions() : false;
  const permissions = isAuthenticated ? metaAuthService.getPermissions() : [];
  
  // Get token information
  const token = metaAuthService.getAccessToken();
  const tokenExists = !!token && token.length > 20;
  const tokenSource = metaAuthService.getTokenSource() || 'unknown';
  const userId = metaAuthService.getUserId() || 'unknown';

  // Calculate days until token expiry
  const daysUntilExpiry = isAuthenticated ? Math.max(0, 60 - tokenInfo.age) : 0;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Connection Status</h3>
      
      <div className="space-y-4">
        {/* Connection Status Summary */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Authentication:</div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">Authenticated</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-red-600">Not Authenticated</span>
              </>
            )}
          </div>
          
          <div>Ad Account:</div>
          <div className="flex items-center">
            {adAccounts.length > 0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">Selected ({adAccounts.length})</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-red-600">Not Selected</span>
              </>
            )}
          </div>
          
          {isAuthenticated && (
            <>
              <div>Token Freshness:</div>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      {tokenInfo.isFresh ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-green-600">Fresh</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-600 mr-1" />
                          <span className="text-amber-600">Aging</span>
                        </>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Token age: {tokenInfo.age} days</p>
                      <p>Expires in: {daysUntilExpiry} days</p>
                      {tokenInfo.age > 45 && (
                        <p>Consider refreshing soon (60 day validity)</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div>Permissions:</div>
              <div className="flex items-center">
                {hasAdPermissions ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">Ad Permissions Granted</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
                    <span className="text-amber-600">Missing Required Permissions</span>
                  </>
                )}
              </div>
              
              <div>Permission Count:</div>
              <div className="flex items-center">
                <span>{permissions.length} permissions</span>
                {permissions.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1">
                        <AlertCircle className="h-3 w-3 text-blue-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-[200px]">
                          <p className="mb-1 font-medium">Granted permissions:</p>
                          <ul className="list-disc pl-4 text-xs">
                            {permissions.map(p => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Connection Troubleshooting Section */}
        {!isAuthenticated && (
          <div className="border-t pt-3 mt-2">
            <h4 className="text-sm font-medium mb-2">Troubleshooting</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Link2Off className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                <span className="text-gray-700">
                  Not connected to Meta API. Visit the <a href="/meta-integration" className="text-blue-600 underline">Meta Integration page</a> to connect.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                <span className="text-gray-700">
                  Token status: {tokenExists ? "Found but invalid" : "Not found"}
                </span>
              </div>
              {onRetryConnection && (
                <Button 
                  onClick={onRetryConnection} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry Connection
                </Button>
              )}
            </div>
          </div>
        )}
        
        {isAuthenticated && adAccounts.length === 0 && (
          <div className="border-t pt-3 mt-2">
            <h4 className="text-sm font-medium mb-2">Next Steps</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                <span>
                  Please select an ad account to view messages. Visit the <a href="/meta-integration?tab=accounts" className="text-blue-600 underline">Accounts tab</a>.
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Debug information for developers - hidden in production */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="border-t pt-3 mt-2 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer font-medium">Debug Information</summary>
              <div className="mt-2 space-y-1 pl-2">
                <div>Token Source: {tokenSource}</div>
                <div>User ID: {userId}</div>
                <div>Token Status: {tokenExists ? 'Present' : 'Missing'}</div>
                {tokenExists && (
                  <div>Token Length: {token?.length}</div>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;
