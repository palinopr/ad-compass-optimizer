
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ValidMetaDatePreset, mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
} | null;

// Extended preset type that includes "custom" for UI purposes
export type UIPresetOption = {
  label: string;
  value: ValidMetaDatePreset | 'custom';
};

// Updated presets to match Meta API accepted values - ONLY use official values
const presets: UIPresetOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7d' },
  { label: 'Last 28 days', value: 'last_28d' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Custom range', value: 'custom' },
];

interface DateRangeSelectorProps {
  onChange: (dateRange: DateRange, preset: ValidMetaDatePreset | 'custom') => void;
  initialPreset?: ValidMetaDatePreset;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  onChange,
  initialPreset = 'last_28d' // Default to last_28d
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ValidMetaDatePreset | 'custom'>('last_28d');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Initialize with last 28 days as default
    const today = new Date();
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(today.getDate() - 28);
    return { from: twentyEightDaysAgo, to: today };
  });

  // Handle validation for initialPreset
  useEffect(() => {
    // Validate the preset to ensure it's strictly Meta API compatible
    const validatedPreset = mapToValidDatePreset(initialPreset);
    
    if (validatedPreset !== initialPreset) {
      console.log(`[DATE SELECTOR] Converted non-standard preset "${initialPreset}" to valid preset "${validatedPreset}"`);
    } else {
      console.log(`[DATE SELECTOR] Using validated preset: "${validatedPreset}"`);
    }
    
    handlePresetChange(validatedPreset);
  }, [initialPreset]);

  const handlePresetChange = (preset: ValidMetaDatePreset | 'custom') => {
    // For custom preset, we just update the UI state without modifying date range
    if (preset === 'custom') {
      setSelectedPreset('custom');
      setIsCalendarOpen(true);
      return;
    }
    
    // Ensure the preset is valid
    const validatedPreset = mapToValidDatePreset(preset);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    let newRange: DateRange = null;
    
    switch (validatedPreset) {
      case 'today':
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Start of today
        newRange = { from: startOfToday, to: today };
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const startOfYesterday = new Date(yesterday);
        startOfYesterday.setHours(0, 0, 0, 0); // Start of yesterday
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999); // End of yesterday
        newRange = { from: startOfYesterday, to: endOfYesterday };
        break;
      case 'last_7d':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago
        newRange = { from: sevenDaysAgo, to: today };
        break;
      case 'last_28d':
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(today.getDate() - 28);
        twentyEightDaysAgo.setHours(0, 0, 0, 0); // Start of 28 days ago
        newRange = { from: twentyEightDaysAgo, to: today };
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        newRange = { from: startOfMonth, to: today };
        break;
      case 'last_month':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startOfLastMonth.setHours(0, 0, 0, 0);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        newRange = { from: startOfLastMonth, to: endOfLastMonth };
        break;
      default:
        console.warn(`[DATE SELECTOR] Unhandled preset: ${validatedPreset}, using last_28d`);
        const defaultDaysAgo = new Date();
        defaultDaysAgo.setDate(today.getDate() - 28);
        defaultDaysAgo.setHours(0, 0, 0, 0);
        newRange = { from: defaultDaysAgo, to: today };
        preset = 'last_28d';
        break;
    }

    console.log(`[DATE SELECTOR] Date preset selected: ${validatedPreset}`, newRange);
    setSelectedPreset(validatedPreset);
    setDateRange(newRange);
    onChange(newRange, validatedPreset);
    
    if (validatedPreset !== 'custom') {
      setIsCalendarOpen(false);
    }
  };

  const handleCalendarSelect = (range: DateRange) => {
    if (range?.from && range?.to) {
      // Set end of day for the "to" date
      const endDate = new Date(range.to);
      endDate.setHours(23, 59, 59, 999);
      
      const updatedRange = { from: range.from, to: endDate };
      setDateRange(updatedRange);
      onChange(updatedRange, 'custom');
    } else {
      setDateRange(range);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Select date range';
    
    const fromDate = format(dateRange.from, 'MMM d, yyyy');
    
    if (!dateRange.to || dateRange.from.toDateString() === dateRange.to.toDateString()) {
      return fromDate;
    }
    
    return `${fromDate} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  // Find the label for the current preset
  const currentPresetLabel = presets.find(p => p.value === selectedPreset)?.label || 'Custom';

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentPresetLabel}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {presets.map((preset) => (
            <DropdownMenuItem 
              key={preset.value}
              onClick={() => handlePresetChange(preset.value)}
              className={cn(
                selectedPreset === preset.value && "bg-accent"
              )}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "flex justify-start text-left",
              isCalendarOpen && "border-primary"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
