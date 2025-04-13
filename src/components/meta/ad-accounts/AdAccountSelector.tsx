
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { useAdAccounts } from './hooks/useAdAccounts';
import { useAdAccountSelection } from './hooks/useAdAccountSelection';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';

const AdAccountSelector = () => {
  const { adAccounts, isLoading, error, fetchAdAccounts } = useAdAccounts();
  const { selectedAccount, handleAccountChange } = useAdAccountSelection(adAccounts);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  
  const [showSelector, setShowSelector] = useState(true);

  // Always check if we have a real token on mount to ensure consistency
  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const effectiveIsAuthenticated = token && token.length >= 50;
    
    console.log('AdAccountSelector mount - Auth check:', 
                effectiveIsAuthenticated ? 'Authenticated' : 'Not authenticated',
                'Context state:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    
    // Force context refresh if there's a mismatch to maintain consistency
    if (effectiveIsAuthenticated !== isAuthenticated) {
      console.log('Auth state mismatch in AdAccountSelector, refreshing...');
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);
  
  // This ensures the component remains visible regardless of account selection
  useEffect(() => {
    setShowSelector(true);
  }, [selectedAccount]);

  // Skip rendering if the token is missing - rely on direct check rather than context
  const token = metaAuthService.getAccessToken();
  if (!token) {
    console.log('AdAccountSelector - No token found, not rendering selector');
    return null;
  }

  return (
    <Card className={showSelector ? 'opacity-100' : 'opacity-0'}>
      <CardHeader>
        <CardTitle className="text-lg">Select Ad Account</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              onClick={fetchAdAccounts} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : adAccounts.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm mb-2">Choose an ad account to view and manage campaigns:</div>
            
            <div className="grid gap-2">
              {adAccounts.map((account) => (
                <Button
                  key={account.id}
                  variant={selectedAccount === account.id.replace(/^act_/, '') ? "default" : "outline"}
                  className={`justify-start w-full ${
                    selectedAccount === account.id.replace(/^act_/, '') 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleAccountChange(account.id.replace(/^act_/, ''))}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{account.name}</span>
                    {selectedAccount === account.id.replace(/^act_/, '') && (
                      <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedAccount && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm mt-4 flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Ad account selected successfully
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No ad accounts available. Please make sure you have access to ad accounts in your Meta Business Manager.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdAccountSelector;
