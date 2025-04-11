
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

interface AdAccountSelectorProps {
  adAccounts: AdAccount[];
  isLoading?: boolean;
  error?: string | null;
  onAccountsSelected: (selectedAccounts: string[]) => void;
}

const BusinessAdAccountSelector: React.FC<AdAccountSelectorProps> = ({ 
  adAccounts, 
  isLoading = false, 
  error = null,
  onAccountsSelected 
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === adAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(adAccounts.map(account => account.id));
    }
  };

  const handleContinue = () => {
    if (selectedAccounts.length > 0) {
      onAccountsSelected(selectedAccounts);
    }
  };

  const getAccountStatusLabel = (status: number) => {
    switch (status) {
      case 1: return { label: 'Active', variant: 'success' as const };
      case 2: return { label: 'Disabled', variant: 'destructive' as const };
      case 3: return { label: 'Unsettled', variant: 'warning' as const };
      case 7: return { label: 'Pending Review', variant: 'secondary' as const };
      case 9: return { label: 'In Grace Period', variant: 'warning' as const };
      default: return { label: 'Unknown', variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-gray-500">Loading Ad Accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        <p className="font-medium">Error loading ad accounts</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Ad Accounts</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSelectAll}
          disabled={adAccounts.length === 0}
        >
          {selectedAccounts.length === adAccounts.length && adAccounts.length > 0 ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500">
        Choose which ad accounts you want to connect to the platform.
      </p>
      
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {adAccounts.map((account) => {
          const status = getAccountStatusLabel(account.account_status);
          
          return (
            <div 
              key={account.id} 
              className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                id={`account-${account.id}`}
                checked={selectedAccounts.includes(account.id)}
                onCheckedChange={() => handleToggleAccount(account.id)}
              />
              <div className="flex-1">
                <label 
                  htmlFor={`account-${account.id}`}
                  className="font-medium cursor-pointer"
                >
                  {account.name}
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs text-gray-500">ID: {account.account_id}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <Badge variant="outline">{account.currency}</Badge>
                </div>
              </div>
            </div>
          );
        })}
        
        {adAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ad accounts found in this Business Manager.
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleContinue} 
        disabled={selectedAccounts.length === 0}
        className="w-full mt-4"
      >
        Connect {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''}
      </Button>
    </div>
  );
};

export default BusinessAdAccountSelector;
