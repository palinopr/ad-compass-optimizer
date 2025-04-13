
import React from 'react';
import BusinessAdAccountSelector from '@/components/meta/BusinessAdAccountSelector';

interface AdAccountSelectionStepProps {
  adAccounts: any[];
  isLoading: boolean;
  error: string | null;
  onAccountsSelected: (selectedAccountIds: string[]) => void;
}

const AdAccountSelectionStep: React.FC<AdAccountSelectionStepProps> = ({
  adAccounts,
  isLoading,
  error,
  onAccountsSelected
}) => {
  return (
    <BusinessAdAccountSelector 
      adAccounts={adAccounts} 
      isLoading={isLoading}
      error={error}
      onAccountsSelected={onAccountsSelected} 
    />
  );
};

export default AdAccountSelectionStep;
