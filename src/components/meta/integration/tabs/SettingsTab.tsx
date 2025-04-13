
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import TokenPermissionsList from '@/components/meta/TokenPermissionsList';
import ConnectionDetails from '../ConnectionDetails';

interface SettingsTabProps {
  isAuthenticated: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ isAuthenticated }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              <TokenPermissionsList />
              
              <h3 className="font-medium mt-4">Connection Details</h3>
              <ConnectionDetails />
            </>
          ) : (
            <p>Please connect your Meta account to manage permission settings.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
