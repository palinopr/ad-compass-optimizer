
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

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
} | null;

export type PresetOption = {
  label: string;
  value: string;
};

// Updated presets to match Meta API accepted values
const presets: PresetOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last_7d' },
  { label: 'Last 28 days', value: 'last_28d' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Custom range', value: 'custom' },
];

// Mapping to help with backward compatibility
const legacyPresetMapping: Record<string, string> = {
  'last30days': 'last_28d',
  'last_30d': 'last_28d',
  'last7days': 'last_7d'
};

interface DateRangeSelectorProps {
  onChange: (dateRange: DateRange, preset: string) => void;
  initialPreset?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  onChange,
  initialPreset = 'last_28d' // Default to last_28d
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    // Initialize with last 28 days as default
    const today = new Date();
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(today.getDate() - 28);
    return { from: twentyEightDaysAgo, to: today };
  });

  // Handle backward compatibility for old preset values
  useEffect(() => {
    // Map legacy presets to new Meta API compatible presets
    let normalizedPreset = initialPreset;
    
    if (legacyPresetMapping[initialPreset]) {
      normalizedPreset = legacyPresetMapping[initialPreset];
      console.log(`[DATE PRESET] Converting legacy "${initialPreset}" to "${normalizedPreset}"`);
    }
    
    handlePresetChange(normalizedPreset);
  }, [initialPreset]);

  const handlePresetChange = (preset: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    let newRange: DateRange = null;
    
    switch (preset) {
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
      case 'last7days': // Legacy support
      case 'last_7d':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago
        newRange = { from: sevenDaysAgo, to: today };
        preset = 'last_7d'; // Ensure we use the correct preset value
        break;
      case 'last30days': // Legacy support
      case 'last_30d': // Legacy support
      case 'last_28d':
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(today.getDate() - 28);
        twentyEightDaysAgo.setHours(0, 0, 0, 0); // Start of 28 days ago
        newRange = { from: twentyEightDaysAgo, to: today };
        preset = 'last_28d'; // Ensure we use the correct preset value
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
      case 'custom':
        // Keep existing date range for custom
        newRange = dateRange;
        setIsCalendarOpen(true);
        break;
    }

    console.log(`[DATE PRESET] Date preset selected: ${preset}`, newRange);
    setSelectedPreset(preset);
    setDateRange(newRange);
    onChange(newRange, preset);
    
    if (preset !== 'custom') {
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
