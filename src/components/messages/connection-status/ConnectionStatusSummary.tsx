
import React from 'react';
import AuthenticationStatus from './AuthenticationStatus';
import AdAccountStatus from './AdAccountStatus';
import TokenFreshnessStatus from './TokenFreshnessStatus';
import PermissionsStatus from './PermissionsStatus';

interface ConnectionStatusSummaryProps {
  isAuthenticated: boolean;
  adAccounts: any[];
  tokenInfo: {
    isFresh: boolean;
    age: number;
  };
  daysUntilExpiry: number;
  hasAdPermissions: boolean;
  permissions: string[];
}

const ConnectionStatusSummary: React.FC<ConnectionStatusSummaryProps> = ({
  isAuthenticated,
  adAccounts,
  tokenInfo,
  daysUntilExpiry,
  hasAdPermissions,
  permissions
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <AuthenticationStatus isAuthenticated={isAuthenticated} />
      <AdAccountStatus adAccounts={adAccounts} />
      
      {isAuthenticated && (
        <>
          <TokenFreshnessStatus tokenInfo={tokenInfo} daysUntilExpiry={daysUntilExpiry} />
          <PermissionsStatus hasAdPermissions={hasAdPermissions} permissions={permissions} />
        </>
      )}
    </div>
  );
};

export default ConnectionStatusSummary;
