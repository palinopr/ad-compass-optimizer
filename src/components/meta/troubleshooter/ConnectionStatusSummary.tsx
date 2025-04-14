
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { metaAuthService } from '@/services/MetaAuthService';
import { Check, X, AlertTriangle } from 'lucide-react';

interface ConnectionStatusSummaryProps {
  missingPermissions: string[];
}

const ConnectionStatusSummary: React.FC<ConnectionStatusSummaryProps> = ({
  missingPermissions
}) => {
  const token = React.useMemo(() => metaAuthService.getAccessToken(), []);
  const selectedAdAccount = React.useMemo(() => localStorage.getItem('selected_ad_account'), []);
  
  const renderStatusIcon = (isValid: boolean) => {
    if (isValid) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    return <X className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Meta Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Token Status */}
        <div className="flex items-start gap-2">
          {renderStatusIcon(!!token)}
          <div>
            <div className={`font-medium ${token ? 'text-green-600' : 'text-red-600'}`}>
              Token: {token ? 'Present' : 'Missing'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {token 
                ? 'Your Meta authentication token is valid and active'
                : 'Please connect your Meta account using Facebook Login to continue'}
            </p>
          </div>
        </div>

        {/* Permissions Status */}
        <div className="flex items-start gap-2">
          {renderStatusIcon(missingPermissions.length === 0)}
          <div>
            <div className={`font-medium ${missingPermissions.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
              Permissions: {missingPermissions.length === 0 ? 'Valid' : 'Missing Required'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {missingPermissions.length === 0
                ? 'You have all necessary permissions to manage campaigns'
                : `Missing: ${missingPermissions.join(', ')} - reconnect your account with these permissions`}
            </p>
          </div>
        </div>

        {/* Ad Account Status */}
        <div className="flex items-start gap-2">
          {selectedAdAccount ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
          <div>
            <div className={`font-medium ${selectedAdAccount ? 'text-green-600' : 'text-amber-600'}`}>
              Ad Account: {selectedAdAccount || 'Not Selected'}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedAdAccount
                ? `Currently managing campaigns for account ${selectedAdAccount}`
                : 'Select an ad account to view and manage campaigns'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusSummary;
