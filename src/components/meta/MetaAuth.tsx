
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMetaConnection } from './hooks/useMetaConnection';
import MetaLoginTabs from './MetaLoginTabs';
import ConnectedAccountInfo from './ConnectedAccountInfo';
import MetaConnectionErrorHandler from './MetaConnectionErrorHandler';

const MetaAuth: React.FC = () => {
  const { 
    isLoggedIn, 
    userData, 
    adAccounts, 
    errorMessage,
    handleLoginSuccess, 
    handleLogout
  } = useMetaConnection();

  const handleError = (error: string) => {
    // This is just a pass-through function - the error handling 
    // is now managed in the useMetaConnection hook
    console.error("Connection error:", error);
  };

  const handleSwitchToToken = () => {
    handleLogout();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meta Ads Account Connection</CardTitle>
        <CardDescription>
          Connect to Meta to manage your ad campaigns and access advertising data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <MetaLoginTabs 
            onLoginSuccess={handleLoginSuccess} 
            onError={handleError} 
          />
        ) : (
          <ConnectedAccountInfo 
            userData={userData}
            adAccounts={adAccounts}
            errorMessage={errorMessage}
            onLogout={handleLogout}
          />
        )}
      </CardContent>

      <MetaConnectionErrorHandler 
        errorMessage={errorMessage} 
        onSwitchToToken={handleSwitchToToken} 
      />
    </Card>
  );
};

export default MetaAuth;
