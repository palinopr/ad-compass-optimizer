
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AccountTabProps {
  userData: any | null;
  isLoading: boolean;
  error: string | null;
}

const AccountTab: React.FC<AccountTabProps> = ({ userData, isLoading, error }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="w-5 h-5 mr-2" />
          User Profile
        </CardTitle>
        <CardDescription>Update your account preferences and personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userData ? (
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                {userData.picture ? (
                  <img 
                    src={userData.picture} 
                    alt="Profile Picture" 
                    className="h-16 w-16 rounded-full" 
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{userData.name || 'Anonymous User'}</h3>
                  <p className="text-sm text-gray-500">{userData.email || 'No email available'}</p>
                </div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Meta App ID</h4>
                  <p className="text-sm">1356517842213704</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Connection Type</h4>
                  <p className="text-sm">{userData ? 'Facebook' : 'Not connected'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {isLoading ? (
                <p>Loading user data...</p>
              ) : error ? (
                <div>
                  <p className="text-red-500">{error}</p>
                  <p className="mt-2">Please connect your Meta account to view profile data.</p>
                </div>
              ) : (
                <p>No user data available. Please connect your Meta account.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTab;
