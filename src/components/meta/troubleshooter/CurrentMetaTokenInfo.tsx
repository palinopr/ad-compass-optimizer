
import React from 'react';
import { Key, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { metaAuthService } from '@/services/MetaAuthService';
import { META_API_CONFIG } from '@/config/socialAuth';

const CurrentMetaTokenInfo = () => {
  const token = metaAuthService.getAccessToken();
  const permissions = metaAuthService.getPermissions();
  const tokenAge = metaAuthService.checkTokenFreshness();
  
  // Check for missing required permissions
  const missingPermissions = META_API_CONFIG.adPermissions.filter(
    perm => !permissions.includes(perm)
  );

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
            <div className="bg-white rounded-md p-2 text-sm space-y-2">
              {permissions.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {permissions.map((perm: string) => (
                    <li key={perm}>{perm}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No permissions found</p>
              )}
              
              {/* Permission Status */}
              {missingPermissions.length > 0 ? (
                <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Missing Required Permissions:</div>
                    <ul className="list-disc pl-4 mt-1">
                      {missingPermissions.map(perm => (
                        <li key={perm}>{perm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  ✅ All required permissions are present
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentMetaTokenInfo;
