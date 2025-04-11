
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building } from 'lucide-react';
import { MetaApiService } from '@/services/MetaApiService';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  business_name?: string;
  currency: string;
}

const AdAccountSelector: React.FC = () => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchAdAccounts = async () => {
      const accessToken = metaAuthService.getAccessToken();
      
      if (!accessToken) {
        setError('Not authenticated with Meta');
        return;
      }
      
      setIsLoading(true);
      try {
        // Check if there are selected ad accounts in local storage
        const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
        let selectedIds: string[] = [];
        
        if (selectedAdAccounts) {
          selectedIds = JSON.parse(selectedAdAccounts);
          console.log('Found selected ad accounts:', selectedIds);
        }
        
        if (selectedIds.length > 0) {
          // Fetch details for these specific accounts
          const token = metaAuthService.getAccessToken();
          if (token) {
            const accounts = await Promise.all(
              selectedIds.map(async (id) => {
                try {
                  const accountDetails = await MetaApiService.fetchAdAccountDetails(token, id);
                  return accountDetails;
                } catch (error) {
                  console.error(`Error fetching details for account ${id}:`, error);
                  return null;
                }
              })
            );
            
            const validAccounts = accounts.filter(account => account !== null) as AdAccount[];
            setAdAccounts(validAccounts);
            
            // Select the first account by default if available
            if (validAccounts.length > 0) {
              setSelectedAccount(validAccounts[0].id);
              localStorage.setItem('selected_ad_account', validAccounts[0].id);
            }
          }
        } else {
          // Fallback to fetching all available accounts
          const accounts = await MetaApiService.fetchAdAccounts(accessToken);
          setAdAccounts(accounts);
          
          if (accounts.length > 0) {
            setSelectedAccount(accounts[0].id);
            localStorage.setItem('selected_ad_account', accounts[0].id);
          }
        }
      } catch (err) {
        setError('Failed to fetch ad accounts');
        toast({
          title: "Error",
          description: "Failed to load Meta ad accounts",
          variant: "destructive"
        });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if we have a stored account selection
    const storedAccountId = localStorage.getItem('selected_ad_account');
    if (storedAccountId) {
      setSelectedAccount(storedAccountId);
    }
    
    fetchAdAccounts();
  }, [toast]);
  
  const handleAccountChange = (value: string) => {
    setSelectedAccount(value);
    localStorage.setItem('selected_ad_account', value);
    
    // Update selected_ad_accounts as well to maintain consistency
    localStorage.setItem('selected_ad_accounts', JSON.stringify([value]));
    
    toast({
      title: "Ad Account Selected",
      description: "Your ad account selection has been updated."
    });
    
    // Reload campaign data by forcing a page refresh
    // This ensures the campaigns component re-fetches data with the new account
    window.location.reload();
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
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : adAccounts.length === 0 ? (
          <div className="text-slate-500 text-sm">No ad accounts found. Please make sure you have access to Meta Ads accounts.</div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select the ad account you want to use for creating and managing campaigns.
            </p>
            <Select value={selectedAccount || ''} onValueChange={handleAccountChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name || account.business_name} ({account.account_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedAccount && (
              <div className="mt-4 text-sm bg-slate-50 p-4 rounded-md border">
                <p className="font-medium mb-2">Selected Account Details:</p>
                {adAccounts
                  .filter(account => account.id === selectedAccount)
                  .map(account => (
                    <div key={account.id} className="space-y-1">
                      <p><span className="font-medium">Name:</span> {account.name || account.business_name}</p>
                      <p><span className="font-medium">Account ID:</span> {account.account_id}</p>
                      <p><span className="font-medium">Currency:</span> {account.currency}</p>
                    </div>
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
