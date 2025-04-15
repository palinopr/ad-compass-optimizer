
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, AlertCircle } from 'lucide-react';

interface AdAccountDebugProps {
  selectedAccount: string | null;
}

const AdAccountDebug: React.FC<AdAccountDebugProps> = ({ selectedAccount }) => {
  const [accountDetails, setAccountDetails] = useState<{
    id: string;
    name?: string;
    status?: number;
    isActive?: boolean;
    currency?: string;
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!selectedAccount) {
        setError('No ad account selected');
        setAccountDetails(null);
        return;
      }

      try {
        // Check if we have cached details first
        const cachedAccountsStr = localStorage.getItem('meta_ad_accounts');
        if (cachedAccountsStr) {
          try {
            const cachedAccounts = JSON.parse(cachedAccountsStr);
            const matchingAccount = cachedAccounts.find((acc: any) => 
              acc.id.replace(/^act_/, '') === selectedAccount.replace(/^act_/, '')
            );
            
            if (matchingAccount) {
              setAccountDetails({
                id: matchingAccount.id,
                name: matchingAccount.name,
                status: matchingAccount.account_status,
                isActive: matchingAccount.account_status === 1,
                currency: matchingAccount.currency
              });
              setError(null);
              return;
            }
          } catch (e) {
            console.error('Error parsing cached accounts:', e);
          }
        }

        // If we don't have cached details, set minimal info
        setAccountDetails({
          id: selectedAccount,
          isActive: undefined
        });
      } catch (err) {
        console.error('Error fetching ad account details:', err);
        setError('Failed to fetch account details');
      }
    };

    fetchAccountDetails();
  }, [selectedAccount]);

  if (!selectedAccount) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
            Ad Account Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No ad account selected.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
          Ad Account Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : accountDetails ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Account ID:</span>
              <span className="text-sm font-mono">{accountDetails.id}</span>
            </div>
            
            {accountDetails.name && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Account Name:</span>
                <span className="text-sm">{accountDetails.name}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              {accountDetails.isActive !== undefined ? (
                <Badge 
                  variant={accountDetails.isActive ? "success" : "destructive"}
                  className={accountDetails.isActive ? 
                    "bg-green-100 text-green-800 hover:bg-green-200" : 
                    "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  {accountDetails.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ) : (
                <Badge variant="outline">Unknown</Badge>
              )}
            </div>
            
            {accountDetails.currency && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Currency:</span>
                <span className="text-sm">{accountDetails.currency}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">Loading account details...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdAccountDebug;
