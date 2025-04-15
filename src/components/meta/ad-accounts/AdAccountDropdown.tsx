import React from 'react';
import { Check, ChevronsUpDown, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdAccount } from './types';

interface AdAccountDropdownProps {
  adAccounts: AdAccount[];
  selectedAccount: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

const AdAccountDropdown: React.FC<AdAccountDropdownProps> = ({
  adAccounts,
  selectedAccount,
  isLoading,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Safe check for account data and validation
  const safeAccounts = React.useMemo(() => {
    try {
      if (!adAccounts || !Array.isArray(adAccounts)) {
        console.error('[META] Invalid ad accounts data:', adAccounts);
        setError('Failed to load ad accounts. Please try refreshing.');
        return [];
      }
      
      const validAccounts = adAccounts.filter(account => account && account.id);
      console.log('[META AD ACCOUNTS] Valid accounts:', validAccounts.length);
      
      if (selectedAccount && !validAccounts.some(acc => 
        acc.id.replace(/^act_/, '') === selectedAccount.replace(/^act_/, '')
      )) {
        console.warn('[META] Selected account not found in valid accounts:', selectedAccount);
        setError('Selected account is not available. Please choose a valid account.');
      } else {
        setError(null);
      }
      
      return validAccounts;
    } catch (err) {
      console.error('[META] Error processing accounts:', err);
      setError('Failed to process ad accounts. Please try refreshing.');
      return [];
    }
  }, [adAccounts, selectedAccount]);

  // Find the selected account label
  const selectedAccountLabel = React.useMemo(() => {
    try {
      if (isLoading) return 'Loading accounts...';
      if (!safeAccounts || safeAccounts.length === 0) return 'No accounts available';

      const account = safeAccounts.find(account => {
        const normalizedId = account.id.replace(/^act_/, '');
        const normalizedSelected = selectedAccount?.replace(/^act_/, '') || '';
        return normalizedId === normalizedSelected;
      });

      return account ? `${account.name} (${account.id})` : 'Select an ad account';
    } catch (err) {
      console.error('[META] Error getting account label:', err);
      return 'Select an ad account';
    }
  }, [safeAccounts, selectedAccount, isLoading]);

  // Handle account selection
  const handleAccountSelect = React.useCallback((accountId: string) => {
    try {
      console.log('[META] Account selected:', accountId);
      onChange(accountId);
      setOpen(false);
      setError(null);
    } catch (err) {
      console.error('[META] Error selecting account:', err);
      setError('Failed to select account. Please try again.');
    }
  }, [onChange]);

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading accounts...
              </div>
            ) : (
              <>
                {selectedAccountLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-white z-50">
          <Command>
            <CommandInput placeholder="Search ad accounts..." />
            <CommandEmpty>No ad accounts found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {safeAccounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.id}
                  onSelect={() => handleAccountSelect(account.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAccount?.replace(/^act_/, '') === account.id?.replace(/^act_/, '') 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{account.name || 'Unnamed Account'}</span>
                    <span className="text-xs text-muted-foreground">{account.id}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdAccountDropdown;
