
import { useState, useEffect } from 'react';
import { ConnectionStep } from './types';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useToast } from '@/hooks/use-toast';

export function useConnectionFlow() {
  const [currentStep, setCurrentStep] = useState<ConnectionStep>(
    metaAuthService.isAuthenticated() ? ConnectionStep.CONNECTED : ConnectionStep.LOGIN
  );
  const [userData, setUserData] = useState<any>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to load user data and account information on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (metaAuthService.isAuthenticated()) {
        // Try to fetch user data
        const token = metaAuthService.getAccessToken();
        if (token) {
          try {
            const userData = await MetaApiService.fetchUserData(token);
            setUserData(userData);
            
            // Try to load selected ad accounts
            const selectedAdAccountsStr = localStorage.getItem('selected_ad_accounts');
            if (selectedAdAccountsStr) {
              try {
                const accountIds = JSON.parse(selectedAdAccountsStr);
                if (Array.isArray(accountIds) && accountIds.length > 0) {
                  const accounts = await Promise.all(
                    accountIds.map(async (id) => {
                      // Format the ID correctly for the API call
                      const formattedId = id.startsWith('act_') ? id : `act_${id}`;
                      try {
                        return await MetaApiService.fetchAdAccountDetails(token, formattedId);
                      } catch (err) {
                        console.error(`Error fetching account ${id}:`, err);
                        return null;
                      }
                    })
                  );
                  
                  const validAccounts = accounts.filter(acc => acc !== null);
                  console.log('Loaded accounts:', validAccounts);
                  setAdAccounts(validAccounts);
                  setSelectedAccounts(validAccounts);
                }
              } catch (err) {
                console.error('Error parsing selected accounts:', err);
                // Clear potentially corrupted data
                localStorage.removeItem('selected_ad_accounts');
              }
            }
          } catch (err) {
            console.error('Error loading initial data:', err);
            setErrorMessage('Failed to load user data');
          }
        }
      }
    };
    
    loadInitialData();
  }, []);

  // Function to handle successful login
  const handleLoginSuccess = (userData: any) => {
    setUserData(userData);
    setCurrentStep(ConnectionStep.SELECT_BUSINESS);
    setErrorMessage(null);
  };

  // Function to handle Business Manager selection
  const handleBusinessSelected = async (businessId: string) => {
    setSelectedBusinessId(businessId);
    setIsLoadingAccounts(true);
    setErrorMessage(null);
    
    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated with Meta');
      }
      
      const accounts = await MetaApiService.fetchAdAccountsForBusiness(token, businessId);
      setAdAccounts(accounts);
      setCurrentStep(ConnectionStep.SELECT_ACCOUNTS);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch ad accounts');
      toast({
        title: "Error",
        description: "Failed to fetch ad accounts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Function to handle Ad Account selection
  const handleAccountsSelected = (selectedAccountIds: string[]) => {
    // Store selected accounts in local storage
    localStorage.setItem('selected_ad_accounts', JSON.stringify(selectedAccountIds));
    
    // Find the selected account objects from the adAccounts array
    const selectedAccountObjects = adAccounts
      .filter(account => selectedAccountIds.includes(account.id));
    
    setSelectedAccounts(selectedAccountObjects);
    
    // If we have selected accounts, also set the primary account
    if (selectedAccountIds.length > 0) {
      // Store without 'act_' prefix for consistency
      const primaryAccountId = selectedAccountIds[0].replace(/^act_/, '');
      localStorage.setItem('selected_ad_account', primaryAccountId);
    }
    
    // Get names of selected accounts for the toast message
    const selectedAccountNames = adAccounts
      .filter(account => selectedAccountIds.includes(account.id))
      .map(account => account.name)
      .join(', ');
    
    toast({
      title: "Success",
      description: `${selectedAccountIds.length} ad account(s) connected successfully: ${selectedAccountNames}`
    });
    
    setCurrentStep(ConnectionStep.CONNECTED);
  };

  // Function to handle logout
  const handleLogout = () => {
    metaAuthService.logout();
    setUserData(null);
    setSelectedBusinessId(null);
    setAdAccounts([]);
    setSelectedAccounts([]);
    setErrorMessage(null);
    setCurrentStep(ConnectionStep.LOGIN);
    
    localStorage.removeItem('selected_ad_accounts');
    localStorage.removeItem('selected_ad_account');
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  // Function to restart the flow
  const handleRestart = () => {
    setCurrentStep(ConnectionStep.LOGIN);
    setSelectedBusinessId(null);
    setAdAccounts([]);
    setSelectedAccounts([]);
    setErrorMessage(null);
  };

  return {
    currentStep,
    userData,
    adAccounts,
    selectedAccounts,
    errorMessage,
    isLoadingAccounts,
    handleLoginSuccess,
    handleBusinessSelected,
    handleAccountsSelected,
    handleLogout,
    handleRestart,
    setCurrentStep
  };
}
