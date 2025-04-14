
import React from 'react';
import { Key, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { metaAuthService } from '@/services/MetaAuthService';

const CurrentMetaTokenInfo = () => {
  const token = metaAuthService.getAccessToken();
  const permissions = metaAuthService.getPermissions();
  const tokenAge = metaAuthService.checkTokenFreshness();

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-800 flex items-center text-lg">
          <Key className="h-4 w-4 mr-2" />
          Current Meta Token & Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex items-center mb-1">
              <Key className="h-3 w-3 mr-1" />
              <span className="font-medium text-sm">Token Status</span>
            </div>
            <div className="bg-white rounded-md p-2 text-sm">
              <div>Present: {token ? '✅ Yes' : '❌ No'}</div>
              {token && (
                <>
                  <div>Length: {token.length} characters</div>
                  <div>Age: {tokenAge.age} days old</div>
                  <div>Freshness: {tokenAge.isFresh ? '✅ Fresh' : '⚠️ May need renewal'}</div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-1">
              <Shield className="h-3 w-3 mr-1" />
              <span className="font-medium text-sm">Permissions</span>
            </div>
            <div className="bg-white rounded-md p-2 text-sm">
              {permissions.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {permissions.map((perm: string) => (
                    <li key={perm}>{perm}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No permissions found</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentMetaTokenInfo;
