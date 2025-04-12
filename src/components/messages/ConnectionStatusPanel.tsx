
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { metaAuthService } from '@/services/MetaAuthService';

interface ConnectionStatusPanelProps {
  isAuthenticated: boolean;
  adAccounts: any[];
}

const ConnectionStatusPanel: React.FC<ConnectionStatusPanelProps> = ({ 
  isAuthenticated, 
  adAccounts 
}) => {
  // Get token freshness information
  const tokenInfo = isAuthenticated ? metaAuthService.checkTokenFreshness() : { isFresh: false, age: 0 };
  
  // Get permission information
  const hasAdPermissions = isAuthenticated ? metaAuthService.hasAdAccountPermissions() : false;
  const permissions = isAuthenticated ? metaAuthService.getPermissions() : [];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Connection Status</h3>
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
    </div>
  );
};

export default ConnectionStatusPanel;
