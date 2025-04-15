
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdAccount } from './types';

interface AdAccountDropdownProps {
  adAccounts: AdAccount[];
  selectedAccount: string | null;
  isLoading: boolean;
  onChange: (accountId: string) => void;
}

const AdAccountDropdown: React.FC<AdAccountDropdownProps> = ({ 
  adAccounts, 
  selectedAccount, 
  isLoading, 
  onChange 
}) => {
  const [error, setError] = useState<string | null>(null);

  // Safe handler to avoid crashes
  const handleAccountChange = (value: string) => {
    try {
      if (!value) {
        console.warn('[META] Empty value in ad account dropdown');
        setError('Invalid selection');
        return;
      }
      setError(null);
      onChange(value);
    } catch (err) {
      console.error('[META] Error in account dropdown change:', err);
      setError('Failed to change account');
    }
  };

  // Safety check for malformed adAccounts data
  const isValidAdAccountsList = Array.isArray(adAccounts) && 
    adAccounts.every(account => account && typeof account === 'object' && account.id);

  if (!isValidAdAccountsList && !isLoading) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid ad accounts data. Please refresh the page or reconnect your Meta account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Select
        value={selectedAccount || ''}
        onValueChange={handleAccountChange}
        disabled={isLoading || adAccounts.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={
            isLoading 
              ? 'Loading ad accounts...' 
              : adAccounts.length === 0 
                ? 'No ad accounts found' 
                : 'Select an ad account'
          }>
            {selectedAccount && adAccounts.find(acc => 
              acc.id.replace(/^act_/, '') === selectedAccount.replace(/^act_/, '')
            )?.name}
            {isLoading && <RefreshCw className="ml-2 h-4 w-4 animate-spin inline-block" />}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {isValidAdAccountsList ? (
            adAccounts.map((account) => (
              <SelectItem 
                key={account.id.replace(/^act_/, '')} 
                value={account.id.replace(/^act_/, '')}
              >
                {account.name} ({account.id.replace(/^act_/, '')})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="error" disabled>
              Error loading accounts
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AdAccountDropdown;
