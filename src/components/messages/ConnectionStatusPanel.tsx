
import React from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import ConnectionStatusSummary from './connection-status/ConnectionStatusSummary';
import Troubleshooting from './connection-status/Troubleshooting';
import NextSteps from './connection-status/NextSteps';
import DebugInfo from './connection-status/DebugInfo';

interface ConnectionStatusPanelProps {
  isAuthenticated: boolean;
  adAccounts: any[];
  onRetryConnection?: () => void;
  onConnectWithBrowser?: () => void;
}

const ConnectionStatusPanel: React.FC<ConnectionStatusPanelProps> = ({ 
  isAuthenticated, 
  adAccounts,
  onRetryConnection,
  onConnectWithBrowser
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
        <ConnectionStatusSummary
          isAuthenticated={isAuthenticated}
          adAccounts={adAccounts}
          tokenInfo={tokenInfo}
          daysUntilExpiry={daysUntilExpiry}
          hasAdPermissions={hasAdPermissions}
          permissions={permissions}
        />
        
        {/* Connection Troubleshooting Section */}
        {!isAuthenticated && (
          <Troubleshooting
            tokenExists={tokenExists}
            onRetryConnection={onRetryConnection}
            onConnectWithBrowser={onConnectWithBrowser}
          />
        )}
        
        {/* Next Steps for Authenticated Users without Ad Accounts */}
        {isAuthenticated && adAccounts.length === 0 && <NextSteps />}
        
        {/* Debug information for developers - hidden in production */}
        <DebugInfo
          tokenSource={tokenSource}
          userId={userId}
          tokenExists={tokenExists}
          tokenLength={token?.length}
        />
      </div>
    </div>
  );
};

export default ConnectionStatusPanel;
