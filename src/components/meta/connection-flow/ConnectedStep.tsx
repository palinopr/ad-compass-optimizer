
import React from 'react';
import ConnectedAccountInfo from '@/components/meta/ConnectedAccountInfo';
import ReAuthenticateButton from '@/components/meta/ReAuthenticateButton';
import { Button } from '@/components/ui/button';

interface ConnectedStepProps {
  userData: any;
  selectedAccounts: any[];
  errorMessage: string | null;
  onLogout: () => void;
  onRestart: () => void;
  onChangeBusinessManager: () => void;
}

const ConnectedStep: React.FC<ConnectedStepProps> = ({
  userData,
  selectedAccounts,
  errorMessage,
  onLogout,
  onRestart,
  onChangeBusinessManager
}) => {
  return (
    <div className="space-y-4">
      <ConnectedAccountInfo 
        userData={userData} 
        adAccounts={selectedAccounts}
        errorMessage={errorMessage}
        onLogout={onLogout}
      />
      
      <div className="mt-4 flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Re-authenticate or Restart</h3>
        <p className="text-sm text-gray-500">
          If you're experiencing connection issues or need to select different Business Managers or ad accounts, you can re-authenticate or restart the setup process.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <ReAuthenticateButton onReAuthenticated={onRestart} />
          <Button variant="secondary" onClick={onChangeBusinessManager}>
            Change Business Manager
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectedStep;
