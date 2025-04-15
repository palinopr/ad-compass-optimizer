
import React from 'react';
import { Card } from '@/components/ui/card';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useAdAccountsFetching } from '@/components/meta/ad-accounts/hooks/useAdAccountsFetching';
import { metaAuthService } from '@/services/MetaAuthService';

const AdAccountDiagnostics = () => {
  const { isAuthenticated } = useMetaConnection();
  const { adAccounts, error, isLoading } = useAdAccountsFetching();
  const token = metaAuthService.getAccessToken();
  const selectedAdAccount = localStorage.getItem('selected_ad_account');

  // Enhanced logging for debugging
  console.log('[CAMPAIGNS TAB] Meta connection status:', {
    isAuthenticated,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    selectedAdAccount,
    adAccountsCount: adAccounts?.length || 0
  });

  if (process.env.NODE_ENV === 'production') {
    return null; // Only show in development
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <h3 className="font-medium mb-2 text-yellow-800">🔍 Meta Connection Diagnostics</h3>
      
      <div className="space-y-2 text-sm text-yellow-700">
        {/* Token Status */}
        <div>
          <strong>Token Status:</strong> {' '}
          {token ? (
            <span className="text-green-600">✅ Present ({token.substring(0, 10)}...)</span>
          ) : (
            <span className="text-red-600">❌ Missing</span>
          )}
        </div>

        {/* Authentication Status */}
        <div>
          <strong>Meta Authentication:</strong> {' '}
          {isAuthenticated ? (
            <span className="text-green-600">✅ Authenticated</span>
          ) : (
            <span className="text-red-600">❌ Not authenticated</span>
          )}
        </div>

        {/* Selected Account */}
        <div>
          <strong>Selected Ad Account:</strong> {' '}
          {selectedAdAccount ? (
            <span className="text-blue-600">{selectedAdAccount}</span>
          ) : (
            <span className="text-red-600">None selected</span>
          )}
        </div>

        {/* Ad Accounts List */}
        <div>
          <strong>Available Ad Accounts:</strong> {' '}
          {isLoading ? (
            <span className="text-blue-600">Loading...</span>
          ) : error ? (
            <span className="text-red-600">Error: {error}</span>
          ) : adAccounts.length > 0 ? (
            <div className="mt-2 space-y-1">
              {adAccounts.map(account => (
                <div key={account.id} className="text-xs bg-white p-2 rounded border border-yellow-200">
                  {account.name} – {account.id}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-red-600">No accounts found</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdAccountDiagnostics;
