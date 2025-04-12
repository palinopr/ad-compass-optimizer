
import { useState, useEffect } from 'react';
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

export const useAdAccounts = () => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchAdAccounts = async () => {
    const accessToken = metaAuthService.getAccessToken();
    
    if (!accessToken) {
      setError('Not authenticated with Meta');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching ad accounts...');
      // Check if there are selected ad accounts in local storage
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      let selectedIds: string[] = [];
      
      if (selectedAdAccounts) {
        try {
          selectedIds = JSON.parse(selectedAdAccounts);
          console.log('Found selected ad accounts:', selectedIds);
        } catch (e) {
          console.error('Error parsing selected ad accounts:', e);
          // Reset the corrupted storage
          localStorage.removeItem('selected_ad_accounts');
        }
      }
      
      if (selectedIds.length > 0) {
        // Fetch details for these specific accounts
        const token = metaAuthService.getAccessToken();
        if (token) {
          try {
            // First validate the token with a basic check
            const connectionTest = await MetaApiService.testConnection(token);
            if (!connectionTest.success) {
              throw new Error(connectionTest.error || 'Invalid or expired token');
            }
            
            const accounts = await Promise.all(
              selectedIds.map(async (id) => {
                try {
                  // Format the ID correctly for the API call
                  const formattedId = id.startsWith('act_') ? id : `act_${id}`;
                  console.log(`Fetching details for account ${formattedId}`);
                  const accountDetails = await MetaApiService.fetchAdAccountDetails(token, formattedId);
                  return accountDetails;
                } catch (error) {
                  console.error(`Error fetching details for account ${id}:`, error);
                  return null;
                }
              })
            );
            
            const validAccounts = accounts.filter(account => account !== null) as AdAccount[];
            console.log('Valid accounts retrieved:', validAccounts.length);
            
            if (validAccounts.length === 0) {
              // Try fetching all available accounts as fallback
              console.log('No valid accounts found from stored IDs, fetching all available accounts');
              const allAccounts = await MetaApiService.fetchAdAccounts(token);
              setAdAccounts(allAccounts);
              
              if (allAccounts.length > 0) {
                // Store without 'act_' prefix for consistency
                const accountId = allAccounts[0].id.replace(/^act_/, '');
                setSelectedAccount(accountId);
                localStorage.setItem('selected_ad_account', accountId);
                localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
                console.log(`Selected first available account: ${accountId}`);
              }
            } else {
              setAdAccounts(validAccounts);
              
              // Check for primary account selection
              const primaryAccount = localStorage.getItem('selected_ad_account');
              if (primaryAccount) {
                setSelectedAccount(primaryAccount);
                console.log(`Using stored primary account: ${primaryAccount}`);
              } else if (validAccounts.length > 0) {
                // Store without 'act_' prefix for consistency
                const accountId = validAccounts[0].id.replace(/^act_/, '');
                setSelectedAccount(accountId);
                localStorage.setItem('selected_ad_account', accountId);
                console.log(`Selected account: ${accountId}`);
              }
            }
          } catch (err) {
            // Handle token validation error
            const errorMessage = err instanceof Error ? err.message : String(err);
            
            if (errorMessage.includes('token') || 
                errorMessage.includes('400') || 
                errorMessage.includes('401')) {
              setError('Your Meta access token appears to be invalid or expired. Please reconnect your account.');
              // Flag for reconnection
              localStorage.setItem('show_meta_connection', 'true');
              localStorage.setItem('meta_connection_context', 'token');
            } else {
              setError('Failed to fetch ad accounts');
            }
            
            console.error(err);
            throw err; // Rethrow to be caught by outer catch
          }
        }
      } else {
        // Fallback to fetching all available accounts
        console.log('No stored accounts, fetching all available accounts');
        
        // Validate token first
        const connectionTest = await MetaApiService.testConnection(accessToken);
        if (!connectionTest.success) {
          throw new Error(connectionTest.error || 'Invalid or expired token');
        }
        
        const accounts = await MetaApiService.fetchAdAccounts(accessToken);
        setAdAccounts(accounts);
        
        if (accounts.length > 0) {
          // Store without 'act_' prefix for consistency
          const accountId = accounts[0].id.replace(/^act_/, '');
          setSelectedAccount(accountId);
          localStorage.setItem('selected_ad_account', accountId);
          localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
          console.log(`Selected first available account: ${accountId}`);
        } else {
          console.log('No accounts available');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('token') || 
          errorMessage.includes('400') || 
          errorMessage.includes('401')) {
        setError('Your Meta access token appears to be invalid or expired. Please reconnect your account.');
      } else {
        setError('Failed to fetch ad accounts');
      }
      
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

  useEffect(() => {
    // Check if we have a stored account selection
    const storedAccountId = localStorage.getItem('selected_ad_account');
    if (storedAccountId) {
      console.log('Using stored account selection:', storedAccountId);
      setSelectedAccount(storedAccountId);
    }
    
    fetchAdAccounts();
  }, []);

  const handleAccountChange = (value: string) => {
    // Store without 'act_' prefix for consistency
    const accountId = value.replace(/^act_/, '');
    setSelectedAccount(accountId);
    localStorage.setItem('selected_ad_account', accountId);
    
    // Update selected_ad_accounts as well to maintain consistency
    localStorage.setItem('selected_ad_accounts', JSON.stringify([accountId]));
    
    toast({
      title: "Ad Account Selected",
      description: "Your ad account selection has been updated."
    });
    
    // Reload campaign data by forcing a page refresh
    // This ensures the campaigns component re-fetches data with the new account
    window.location.reload();
  };
  
  return {
    adAccounts,
    selectedAccount,
    isLoading,
    error,
    fetchAdAccounts,
    handleAccountChange
  };
};
