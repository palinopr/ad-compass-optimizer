
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ShareIcon, User, Key } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { Button } from '@/components/ui/button';
import { metaAuthService } from '@/services/MetaAuthService';
import TokenPermissionsList from '@/components/meta/TokenPermissionsList';

interface MetaConnectionTabProps {
  userData: any | null;
  handleDisconnect: () => void;
}

const MetaConnectionTab: React.FC<MetaConnectionTabProps> = ({ userData, handleDisconnect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShareIcon className="w-5 h-5 mr-2" />
          Meta Connection
        </CardTitle>
        <CardDescription>Manage your connection to the Meta Marketing API.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userData ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-700 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Connected as {userData.name}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Meta User ID</h4>
                  <p className="text-sm">{metaAuthService.getUserId() || 'Not available'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Connection Method</h4>
                  <p className="text-sm capitalize">{metaAuthService.getTokenSource()}</p>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-1" />
                  Token Permissions
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Configure which permissions are enabled for your Meta connection. 
                  Note that changing permissions might require re-authentication for some operations.
                </p>
                <TokenPermissionsList />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-3">Ad Account Selection</h4>
                <AdAccountSelector />
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="destructive" 
                  onClick={handleDisconnect}
                >
                  Disconnect Meta Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>You are not connected to the Meta Marketing API.</p>
              <p className="text-sm text-gray-500">Connect your Meta account to access ad data and manage campaigns.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaConnectionTab;
