
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { metaAuthService } from '@/services/MetaAuthService';
import StatusRow from './StatusRow';

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
        <StatusRow
          isValid={!!token}
          label="Token"
          value={token ? 'Present' : 'Missing'}
        />
        
        <StatusRow
          isValid={missingPermissions.length === 0}
          label="Permissions"
          value={missingPermissions.length === 0 ? 
            'Valid' : 
            `Missing: ${missingPermissions.join(', ')}`}
        />
        
        <StatusRow
          isValid={!!selectedAdAccount}
          label="Ad Account"
          value={selectedAdAccount ? selectedAdAccount : 'Not selected'}
        />
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusSummary;
