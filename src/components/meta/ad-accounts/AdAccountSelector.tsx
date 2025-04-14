
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdAccounts } from './hooks/useAdAccounts';
import AdAccountDropdown from './AdAccountDropdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPermissionErrorMessage, isPermissionError } from '@/services/api/meta-accounts/permissionErrors';
import { metaAuthService } from '@/services/MetaAuthService';

const AdAccountSelector = () => {
  const { adAccounts, selectedAccount, isLoading, error, fetchAdAccounts, handleAccountChange } = useAdAccounts();

  const handleResetConnection = () => {
    // Clear Meta-related data
    metaAuthService.logout();
    localStorage.removeItem('selected_ad_account');
    localStorage.removeItem('selected_ad_accounts');
    
    // Force page refresh to reinitialize connection flow
    window.location.reload();
  };

  // Format the error message to be more user-friendly
  const getFormattedError = () => {
    if (!error) {
      console.log('[❌ AD ACCOUNT ERROR] No error detected');
      return null;
    }

    console.log('[🔍 AD ACCOUNT ERROR] Raw Error:', error);

    try {
      // Try to parse if the error is a stringified JSON
      const parsedError = typeof error === 'string' && error.startsWith('{') 
        ? JSON.parse(error) 
        : null;

      console.log('[🔍 AD ACCOUNT ERROR] Parsed Error:', parsedError);

      if (parsedError?.error) {
        const formattedMessage = getPermissionErrorMessage(parsedError.error);
        console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', formattedMessage);
        return {
          message: formattedMessage,
          isPermissionError: isPermissionError(parsedError.error)
        };
      }

      // If we have a string error that's not JSON, show it directly
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Message:', error);
      return { message: error, isPermissionError: false };
    } catch (e) {
      console.error('[❌ AD ACCOUNT ERROR] Error parsing:', e);
      // If parsing fails, return a fallback
      const fallbackMessage = error || 'Failed to fetch ad accounts. See console for details.';
      console.log('[✅ AD ACCOUNT ERROR SHOWN] Fallback Message:', fallbackMessage);
      return { message: fallbackMessage, isPermissionError: false };
    }
  };

  const formattedError = getFormattedError();

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
            <div className="space-y-3">
              <Alert variant="destructive">
                <AlertDescription className="text-sm whitespace-pre-wrap break-words">
                  {formattedError?.message}
                </AlertDescription>
              </Alert>
              
              {formattedError?.isPermissionError && (
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={handleResetConnection}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect Meta Account
                </Button>
              )}
            </div>
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
