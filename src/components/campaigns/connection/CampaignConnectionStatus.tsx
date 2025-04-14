
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { metaAuthService } from '@/services/MetaAuthService';

const CampaignConnectionStatus = () => {
  const token = metaAuthService.getAccessToken();
  const permissions = metaAuthService.getPermissions();
  const selectedAccount = localStorage.getItem('selected_ad_account');
  const isMockMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const lastApiCall = localStorage.getItem('last_campaign_fetch_attempt');
  const lastApiSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString('en-US', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-amber-500" />
    );
  };

  const getConnectionStatus = () => {
    if (!token) return '🔴 Not Connected';
    if (!permissions.length) return '🟡 Missing Permissions';
    if (!selectedAccount) return '🟡 No Ad Account Selected';
    return '🟢 Fully Connected';
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm font-medium">
          <Shield className="h-4 w-4 mr-2" />
          Connection Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Token:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(!!token)}
              {token ? `Present (${token.length} chars)` : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Permissions:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(permissions.includes('ads_read'))}
              ads_read
              {getStatusIcon(permissions.includes('ads_management'))}
              ads_management
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ad Account:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(!!selectedAccount)}
              {selectedAccount ? `Selected (${selectedAccount})` : 'Not Selected'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mock Mode:</span>
            <span className="flex items-center gap-2">
              {isMockMode ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {isMockMode ? 'Meta API Mock Active' : 'Production Mode'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last API Call:</span>
            <span className="flex items-center gap-2">
              {getStatusIcon(lastApiSuccess)}
              {lastApiSuccess ? 'Successful' : 'Failed'} @ {formatTimestamp(lastApiCall)}
            </span>
          </div>
        </div>

        <div className={cn(
          "mt-4 p-2 rounded text-sm font-medium",
          token && permissions.length && selectedAccount ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
        )}>
          {getConnectionStatus()}
          {token && permissions.length && selectedAccount && (
            <div className="text-xs font-normal mt-1">
              🔁 Campaigns will refresh on next API call
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignConnectionStatus;
