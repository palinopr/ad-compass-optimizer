
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConnectionStep, MetaConnectionFlowProps } from './types';
import { useConnectionFlow } from './useConnectionFlow';

// Import step components
import LoginStep from './LoginStep';
import BusinessSelectionStep from './BusinessSelectionStep';
import AdAccountSelectionStep from './AdAccountSelectionStep';
import ConnectedStep from './ConnectedStep';
import ConnectionFlowError from './ConnectionFlowError';

const MetaConnectionFlow: React.FC<MetaConnectionFlowProps> = ({ onComplete }) => {
  const {
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
  } = useConnectionFlow();

  const getStepDescription = () => {
    switch (currentStep) {
      case ConnectionStep.LOGIN:
        return "Connect your Facebook account to manage campaigns with your Meta Business assets";
      case ConnectionStep.SELECT_BUSINESS:
        return "Select a Business Manager to access campaign data";
      case ConnectionStep.SELECT_ACCOUNTS:
        return "Choose which ad accounts you want to use for campaigns";
      case ConnectionStep.CONNECTED:
        return "Your Meta Business Manager is connected for campaign management";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meta Business Integration</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === ConnectionStep.LOGIN && (
          <LoginStep onLoginSuccess={handleLoginSuccess} />
        )}
        
        {currentStep === ConnectionStep.SELECT_BUSINESS && (
          <BusinessSelectionStep onSelect={handleBusinessSelected} />
        )}
        
        {currentStep === ConnectionStep.SELECT_ACCOUNTS && (
          <AdAccountSelectionStep 
            adAccounts={adAccounts} 
            isLoading={isLoadingAccounts}
            error={errorMessage}
            onAccountsSelected={handleAccountsSelected} 
          />
        )}
        
        {currentStep === ConnectionStep.CONNECTED && (
          <ConnectedStep 
            userData={userData} 
            selectedAccounts={selectedAccounts}
            errorMessage={errorMessage}
            onLogout={handleLogout}
            onRestart={handleRestart}
            onChangeBusinessManager={() => setCurrentStep(ConnectionStep.SELECT_BUSINESS)}
          />
        )}
        
        {errorMessage && currentStep !== ConnectionStep.CONNECTED && (
          <ConnectionFlowError errorMessage={errorMessage} />
        )}
      </CardContent>
    </Card>
  );
};

export default MetaConnectionFlow;
