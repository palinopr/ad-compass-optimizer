
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdAccountsLoading from './AdAccountsLoading';
import AdAccountsEmpty from './AdAccountsEmpty';
import AdAccountDetails from './AdAccountDetails';
import { useAdAccounts } from './useAdAccounts';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

const AdAccountSelector: React.FC = () => {
  const { 
    adAccounts, 
    selectedAccount, 
    isLoading, 
    error, 
    fetchAdAccounts, 
    handleAccountChange 
  } = useAdAccounts();
  
  const { toast } = useToast();
  
  // Function to handle refresh button click with token validation
  const handleRefresh = async () => {
    // Check if token is valid before refreshing
    const token = metaAuthService.getAccessToken();
    if (!token || token.length < 50) {
      // Show detailed error message
      toast({
        title: "Token Error",
        description: "You need a valid Meta token to refresh ad accounts. Please reconnect your account.",
        variant: "destructive"
      });
      
      // Force token refresh flow if token is invalid
      localStorage.setItem('show_meta_connection', 'true');
      localStorage.setItem('meta_connection_context', 'token');
      
      // Add a small delay before reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return;
    }
    
    // Check token freshness
    const freshness = metaAuthService.checkTokenFreshness();
    if (freshness.age > 50) { // If token is older than 50 days
      toast({
        title: "Token Warning",
        description: `Your token is ${freshness.age} days old and may expire soon. Consider generating a new token.`,
        variant: "default"  // Fixed: using "default" instead of "warning"
      });
    }
    
    fetchAdAccounts();
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <Building className="w-5 h-5 mr-2" />
          Select Ad Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AdAccountsLoading />
        ) : error ? (
          <div className="space-y-4">
            <div className="text-red-500 text-sm">{error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry Connection
            </Button>
          </div>
        ) : adAccounts.length === 0 ? (
          <AdAccountsEmpty onRefresh={handleRefresh} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select the ad account you want to use for creating and managing campaigns.
            </p>
            <Select 
              value={selectedAccount || ''} 
              onValueChange={handleAccountChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map((account) => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id.replace(/^act_/, '')}
                  >
                    {account.name || account.business_name} ({account.account_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
            
            {selectedAccount && (
              <div className="mt-4 text-sm bg-slate-50 p-4 rounded-md border">
                <p className="font-medium mb-2">Selected Account Details:</p>
                {adAccounts
                  .filter(account => account.id.replace(/^act_/, '') === selectedAccount || account.id === selectedAccount)
                  .map(account => (
                    <AdAccountDetails key={account.id} account={account} />
                  ))
                }
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdAccountSelector;
