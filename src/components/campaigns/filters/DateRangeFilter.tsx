
import React, { useEffect } from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';
import { toast } from '@/hooks/use-toast';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

interface DateRangeFilterProps {
  datePreset: string;
  onDateRangeChange: (range: any, preset: string) => void;
}

const DateRangeFilter = ({ datePreset, onDateRangeChange }: DateRangeFilterProps) => {
  // Strictly validate the preset
  const actualPreset = mapToValidDatePreset(datePreset);
  
  useEffect(() => {
    console.log(`[DATE FILTER] Initialized with validated preset: ${actualPreset}`);
  }, [actualPreset]);

  // Handle date range changes with validation
  const handleDateRangeChange = (range: any, preset: string) => {
    const validatedPreset = mapToValidDatePreset(preset);
    console.log(`[DATE FILTER] Changing date to validated preset: ${validatedPreset} (original: ${preset})`);
    
    // Show a toast notification
    if (preset !== datePreset) {
      toast({
        title: "Updating campaigns",
        description: `Fetching campaigns for ${preset === 'custom' ? 'custom date range' : validatedPreset}`,
        duration: 2000
      });
    }
    
    // Call the parent handler with validated preset
    onDateRangeChange(range, validatedPreset);
  };
  
  return (
    <DateRangeSelector 
      onChange={handleDateRangeChange} 
      initialPreset={actualPreset}
    />
  );
};

export default DateRangeFilter;
