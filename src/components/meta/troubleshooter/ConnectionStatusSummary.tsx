
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';

interface ConnectionStatusSummaryProps {
  missingPermissions: string[];
}

const ConnectionStatusSummary: React.FC<ConnectionStatusSummaryProps> = ({
  missingPermissions
}) => {
  const token = React.useMemo(() => metaAuthService.getAccessToken(), []);
  const selectedAdAccount = React.useMemo(() => localStorage.getItem('selected_ad_account'), []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Meta Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {token ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={token ? 'text-green-600' : 'text-red-600'}>
            Token: {token ? 'Present' : 'Missing'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {missingPermissions.length === 0 ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={missingPermissions.length === 0 ? 'text-green-600' : 'text-red-600'}>
            Permissions: {missingPermissions.length === 0 ? 
              'Valid' : 
              `Missing: ${missingPermissions.join(', ')}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedAdAccount ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={selectedAdAccount ? 'text-green-600' : 'text-red-600'}>
            Ad Account: {selectedAdAccount ? 
              selectedAdAccount : 
              'Not selected'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusSummary;

