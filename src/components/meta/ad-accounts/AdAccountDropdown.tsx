
import React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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

  // Find the selected account label to display
  const selectedAccountLabel = React.useMemo(() => {
    try {
      if (isLoading) return 'Loading accounts...';
      if (!adAccounts || adAccounts.length === 0) return 'No accounts available';

      const account = adAccounts.find(account => {
        if (!account || !account.id) return false;
        // Normalize IDs for comparison
        const normalizedId = account.id.replace(/^act_/, '');
        const normalizedSelected = selectedAccount?.replace(/^act_/, '') || '';
        return normalizedId === normalizedSelected;
      });

      return account ? `${account.name} (${account.id})` : 'Select an ad account';
    } catch (err) {
      console.error('[META] Error getting account label:', err);
      return 'Select an ad account';
    }
  }, [adAccounts, selectedAccount, isLoading]);

  const handleAccountSelect = React.useCallback((accountId: string) => {
    try {
      onChange(accountId);
      setOpen(false);
    } catch (err) {
      console.error('[META] Error selecting account:', err);
      setError('Failed to select account. Please try again.');
    }
  }, [onChange]);

  return (
    <div>
      {error && (
        <div className="text-sm text-red-500 mb-2">
          {error}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white"
            disabled={isLoading}
            onClick={(e) => {
              try {
                // This ensures the button click doesn't cause issues
                e.preventDefault();
              } catch (err) {
                console.error('[META] Error in dropdown click:', err);
              }
            }}
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
        <PopoverContent className="w-full p-0 bg-white z-50">
          <Command>
            <CommandInput placeholder="Search ad accounts..." />
            <CommandEmpty>No ad accounts found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {Array.isArray(adAccounts) ? adAccounts.map((account) => (
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
                    <span>{account.name}</span>
                    <span className="text-xs text-muted-foreground">{account.id}</span>
                  </div>
                </CommandItem>
              )) : (
                <CommandItem disabled>Error loading accounts</CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdAccountDropdown;
