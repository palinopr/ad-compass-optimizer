
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdAccounts } from './hooks/useAdAccounts';
import AdAccountDropdown from './AdAccountDropdown';
import AdAccountError from './AdAccountError';
import { metaAuthService } from '@/services/MetaAuthService';

const AdAccountSelector = () => {
  const { 
    adAccounts, 
    selectedAccount, 
    isLoading, 
    error, 
    fetchAdAccounts, 
    handleAccountChange 
  } = useAdAccounts();

  const handleResetConnection = () => {
    // Clear Meta-related data
    metaAuthService.logout();
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    
    // Force page refresh to reinitialize connection flow
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Ad Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <AdAccountError 
              error={error}
              onReconnect={handleResetConnection}
            />
          )}
          
          <AdAccountDropdown
            adAccounts={adAccounts}
            selectedAccount={selectedAccount}
            isLoading={isLoading}
            onChange={handleAccountChange}
          />
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchAdAccounts()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Accounts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountSelector;
