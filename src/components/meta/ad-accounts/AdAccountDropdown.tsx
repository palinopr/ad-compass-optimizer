
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

  // Find the selected account label to display
  const selectedAccountLabel = React.useMemo(() => {
    if (isLoading) return 'Loading accounts...';
    if (adAccounts.length === 0) return 'No accounts available';

    const account = adAccounts.find(account => {
      const normalizedId = account.id.replace(/^act_/, '');
      const normalizedSelected = selectedAccount?.replace(/^act_/, '') || '';
      return normalizedId === normalizedSelected;
    });

    return account ? `${account.name} (${account.id})` : 'Select an ad account';
  }, [adAccounts, selectedAccount, isLoading]);

  return (
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
      <PopoverContent className="w-full p-0 bg-white z-50">
        <Command>
          <CommandInput placeholder="Search ad accounts..." />
          <CommandEmpty>No ad accounts found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {adAccounts.map((account) => (
              <CommandItem
                key={account.id}
                value={account.id}
                onSelect={() => {
                  onChange(account.id);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedAccount?.replace(/^act_/, '') === account.id.replace(/^act_/, '') 
                      ? "opacity-100" 
                      : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{account.name}</span>
                  <span className="text-xs text-muted-foreground">{account.id}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AdAccountDropdown;
