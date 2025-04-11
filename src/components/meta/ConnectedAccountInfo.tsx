
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConnectedAccountInfoProps {
  userData: {
    name?: string;
    email?: string;
    picture?: string;
  };
  adAccounts: any[];
  errorMessage: string | null;
  onLogout: () => void;
}

const ConnectedAccountInfo: React.FC<ConnectedAccountInfoProps> = ({ 
  userData, 
  adAccounts, 
  errorMessage, 
  onLogout 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {userData?.picture && (
          <img 
            src={userData.picture} 
            alt="Profile" 
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h3 className="font-medium">{userData?.name || 'Connected User'}</h3>
          <p className="text-sm text-gray-500">{userData?.email || 'Email not available'}</p>
          {errorMessage && (
            <p className="text-xs text-red-500 mt-1">
              Note: Limited access due to permissions
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Your Ad Accounts</h3>
        {adAccounts.length > 0 ? (
          <div className="space-y-2">
            {adAccounts.map((account) => (
              <div key={account.id} className="p-3 border rounded">
                <p className="font-medium">{account.name}</p>
                <p className="text-sm">Account ID: {account.account_id}</p>
                <p className="text-sm">Status: {account.account_status === 1 ? 'Active' : 'Inactive'}</p>
                <p className="text-sm">Currency: {account.currency}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">No Ad Accounts Available</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>{errorMessage || "No ad accounts found for this user."}</p>
                  <p className="mt-1">
                    For development, try using a System User Token with the appropriate permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        className="mt-4" 
        onClick={onLogout}
      >
        Disconnect Account
      </Button>
    </div>
  );
};

export default ConnectedAccountInfo;
