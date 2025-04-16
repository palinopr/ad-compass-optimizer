
import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange, DatePresetOption } from './types';
import { formatDateRange } from './utils/dateFormatting';
import { useDateRangeSelection } from './hooks/useDateRangeSelection';
import PresetSelector from './components/PresetSelector';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

interface DateRangeSelectorProps {
  onChange: (dateRange: DateRange, preset: DatePresetOption) => void;
  initialPreset?: ValidMetaDatePreset;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  onChange,
  initialPreset = 'last_28d'
}) => {
  const {
    isCalendarOpen,
    setIsCalendarOpen,
    selectedPreset,
    dateRange,
    handlePresetChange,
    handleCalendarSelect
  } = useDateRangeSelection(onChange, initialPreset);

  useEffect(() => {
    const validatedPreset = mapToValidDatePreset(initialPreset);
    
    if (validatedPreset !== initialPreset) {
      console.log(`[DATE SELECTOR] Converted non-standard preset "${initialPreset}" to valid preset "${validatedPreset}"`);
    } else {
      console.log(`[DATE SELECTOR] Using validated preset: "${validatedPreset}"`);
    }
    
    handlePresetChange(validatedPreset);
  }, [initialPreset]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <PresetSelector
        selectedPreset={selectedPreset}
        onPresetChange={handlePresetChange}
      />
      
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
            {formatDateRange(dateRange)}
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
