
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import FacebookLoginTab from '@/components/meta/FacebookLoginTab';
import BusinessManagerSelector from '@/components/meta/BusinessManagerSelector';
import BusinessAdAccountSelector from '@/components/meta/BusinessAdAccountSelector';
import ConnectedAccountInfo from '@/components/meta/ConnectedAccountInfo';
import { metaAuthService } from '@/services/MetaAuthService';
import { MetaApiService } from '@/services/MetaApiService';
import { useToast } from '@/hooks/use-toast';
import ReAuthenticateButton from './ReAuthenticateButton';
import { Button } from '@/components/ui/button';

enum ConnectionStep {
  LOGIN,
  SELECT_BUSINESS,
  SELECT_ACCOUNTS,
  CONNECTED
}

const MetaConnectionFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ConnectionStep>(
    metaAuthService.isAuthenticated() ? ConnectionStep.CONNECTED : ConnectionStep.LOGIN
  );
  const [userData, setUserData] = useState<any>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);
  const { toast } = useToast();

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
  const handleAccountsSelected = (selectedAccounts: string[]) => {
    // Store selected accounts in local storage or state management
    localStorage.setItem('selected_ad_accounts', JSON.stringify(selectedAccounts));
    
    // Get names of selected accounts for the toast message
    const selectedAccountNames = adAccounts
      .filter(account => selectedAccounts.includes(account.id))
      .map(account => account.name)
      .join(', ');
    
    toast({
      title: "Success",
      description: `${selectedAccounts.length} ad account(s) connected successfully: ${selectedAccountNames}`
    });
    
    setCurrentStep(ConnectionStep.CONNECTED);
  };

  // Function to handle logout
  const handleLogout = () => {
    metaAuthService.logout();
    setUserData(null);
    setSelectedBusinessId(null);
    setAdAccounts([]);
    setErrorMessage(null);
    setCurrentStep(ConnectionStep.LOGIN);
    
    localStorage.removeItem('selected_ad_accounts');
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  // Function to restart the flow
  const handleRestart = () => {
    setCurrentStep(ConnectionStep.LOGIN);
    setErrorMessage(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meta Business Integration</CardTitle>
        <CardDescription>
          {currentStep === ConnectionStep.LOGIN && "Connect your Facebook account to access your Business Manager and ad accounts"}
          {currentStep === ConnectionStep.SELECT_BUSINESS && "Select a Business Manager to continue"}
          {currentStep === ConnectionStep.SELECT_ACCOUNTS && "Choose which ad accounts you want to connect"}
          {currentStep === ConnectionStep.CONNECTED && "Your Meta Business Manager is connected"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === ConnectionStep.LOGIN && (
          <FacebookLoginTab onLoginSuccess={handleLoginSuccess} />
        )}
        
        {currentStep === ConnectionStep.SELECT_BUSINESS && (
          <BusinessManagerSelector onSelect={handleBusinessSelected} />
        )}
        
        {currentStep === ConnectionStep.SELECT_ACCOUNTS && (
          <BusinessAdAccountSelector 
            adAccounts={adAccounts} 
            isLoading={isLoadingAccounts}
            error={errorMessage}
            onAccountsSelected={handleAccountsSelected} 
          />
        )}
        
        {currentStep === ConnectionStep.CONNECTED && (
          <div className="space-y-4">
            <ConnectedAccountInfo 
              userData={userData} 
              adAccounts={adAccounts}
              errorMessage={errorMessage}
              onLogout={handleLogout}
            />
            
            <div className="mt-4 flex flex-col space-y-4">
              <h3 className="text-lg font-medium">Re-authenticate or Restart</h3>
              <p className="text-sm text-gray-500">
                If you're experiencing connection issues or need to select different Business Managers or ad accounts, you can re-authenticate or restart the setup process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <ReAuthenticateButton onReAuthenticated={handleRestart} />
                <Button variant="secondary" onClick={() => setCurrentStep(ConnectionStep.SELECT_BUSINESS)}>
                  Change Business Manager
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {errorMessage && currentStep !== ConnectionStep.CONNECTED && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaConnectionFlow;
