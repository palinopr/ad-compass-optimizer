import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, AlertTriangle, Globe, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { metaAuthService } from '@/services/MetaAuthService';

const CampaignConnectionStatus = () => {
  const token = metaAuthService.getAccessToken();
  const permissions = metaAuthService.getPermissions();
  const selectedAccount = localStorage.getItem('selected_ad_account');
  const isMockMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const lastApiCall = localStorage.getItem('last_campaign_fetch_attempt');
  const lastApiSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const lastFetchMetadata = useCampaignFetchState()?.lastFetchMetadata;

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      return format(new Date(timestamp), "h:mm a · MMM d", { hourCycle: 'h12' });
    } catch (e) {
      return timestamp;
    }
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

        {lastFetchMetadata && (
          <div className="mt-4 space-y-2 border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Status:
              </span>
              <span className="flex items-center gap-2">
                {lastFetchMetadata.success ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
                {lastFetchMetadata.status ? `${lastFetchMetadata.status} OK` : 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Campaigns:
              </span>
              <span>{lastFetchMetadata.campaignCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Sync:
              </span>
              <span>{formatTimestamp(lastFetchMetadata.fetchedAt)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Source:</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                lastFetchMetadata.source === 'Mock Data' ? 
                  "bg-amber-100 text-amber-700" : 
                  "bg-blue-100 text-blue-700"
              )}>
                {lastFetchMetadata.source}
              </span>
            </div>
          </div>
        )}

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
