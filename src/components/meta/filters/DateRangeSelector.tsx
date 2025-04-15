
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
  value: 'today' | 'yesterday' | 'last7days' | 'last_28d' | 'custom';
};

const presets: PresetOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 28 days', value: 'last_28d' }, // Updated from last30days to last_28d
  { label: 'Custom range', value: 'custom' },
];

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
    twentyEightDaysAgo.setDate(today.getDate() - 28); // Updated from 30 to 28
    return { from: twentyEightDaysAgo, to: today };
  });

  // Handle backward compatibility for old preset values
  useEffect(() => {
    // If initialPreset is 'last30days', convert it to 'last_28d'
    const normalizedPreset = initialPreset === 'last30days' ? 'last_28d' : initialPreset;
    handlePresetChange(normalizedPreset);
    
    // Log the preset conversion for debugging
    if (initialPreset === 'last30days') {
      console.log('[DATE PRESET] Converting legacy "last30days" to "last_28d"');
    }
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
      case 'last7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of 7 days ago
        newRange = { from: sevenDaysAgo, to: today };
        break;
      case 'last30days': // Handle legacy case
      case 'last_28d':
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(today.getDate() - 28); // Updated from 30 to 28
        twentyEightDaysAgo.setHours(0, 0, 0, 0); // Start of 28 days ago
        newRange = { from: twentyEightDaysAgo, to: today };
        
        // Always use the new format
        preset = 'last_28d';
        break;
      case 'custom':
        // Keep existing date range for custom
        newRange = dateRange;
        setIsCalendarOpen(true);
        break;
    }

    console.log(`Date preset selected: ${preset}`, newRange);
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
