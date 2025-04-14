import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, PlusCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdAccountsFetching } from './ad-accounts/hooks/useAdAccountsFetching';
import { useAdAccountSelection } from '@/hooks/campaigns/useAdAccountSelection';
import { Skeleton } from '@/components/ui/skeleton';
import ExternalMetaLink from './ExternalMetaLink';
import { toast } from '@/hooks/use-toast';

const AdAccountSelector = () => {
  const { 
    adAccounts, 
    isLoading, 
    error, 
    fetchAdAccounts
  } = useAdAccountsFetching();
  
  const { getSelectedAdAccount, switchToAccount } = useAdAccountSelection();
  const selectedAccountData = getSelectedAdAccount();
  const selectedAccount = selectedAccountData.hasAccount 
    ? selectedAccountData.adAccountId.replace('act_', '') 
    : '';

  const handleAccountChange = (value: string) => {
    // First, clear any campaign fetch errors
    localStorage.removeItem('last_campaign_fetch_error');
    
    // Switch to the new account
    switchToAccount(value);
  };

  // Refresh with notification
  const handleRefreshAccounts = () => {
    toast({
      title: "Refreshing Ad Accounts",
      description: "Fetching your latest ad accounts..."
    });
    fetchAdAccounts();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          Ad Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-red-500">🛑 Ad account fetch failed</p>
            <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
              <div className="font-mono text-red-600 whitespace-pre-wrap break-all">
                {error || 'No details returned from Meta'}
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedAccount} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an ad account" />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.length > 0 ? (
                adAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id.replace('act_', '')}>
                    {account.name} ({account.id.replace('act_', '')})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-accounts" disabled>
                  No ad accounts found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshAccounts}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <div className="flex gap-2">
          <ExternalMetaLink type="createCampaign" size="sm">
            <PlusCircle className="h-3 w-3" />
            Create Campaign
          </ExternalMetaLink>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdAccountSelector;
