
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdAccountDropdown from './ad-accounts/AdAccountDropdown';
import { useAdAccounts } from './ad-accounts/hooks/useAdAccounts';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdAccountSelector = () => {
  const { 
    adAccounts, 
    selectedAccount, 
    isLoading, 
    error, 
    fetchAdAccounts, 
    handleAccountChange 
  } = useAdAccounts();

  // Log accounts for debugging
  React.useEffect(() => {
    console.log('[META] Available Ad Accounts:', adAccounts);
    console.log('[META] Selected Account:', selectedAccount);
  }, [adAccounts, selectedAccount]);

  const handleRefresh = () => {
    toast({
      title: "Refreshing Ad Accounts",
      description: "Fetching your latest Meta ad accounts..."
    });
    fetchAdAccounts();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
          Ad Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-red-500">Error fetching ad accounts</p>
            <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
              <code className="text-red-600 whitespace-pre-wrap break-all">
                {error}
              </code>
            </div>
          </div>
        )}
        
        {adAccounts.length === 0 && !isLoading && !error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ No ad accounts returned. Please check Meta permissions and token scopes.
            </AlertDescription>
          </Alert>
        )}
        
        <AdAccountDropdown
          adAccounts={adAccounts}
          selectedAccount={selectedAccount}
          isLoading={isLoading}
          onChange={handleAccountChange}
        />
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Accounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountSelector;
