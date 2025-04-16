
import React, { useEffect } from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';
import { DateRange, DatePresetOption } from '@/components/meta/filters/types';
import { toast } from '@/hooks/use-toast';
import { mapToValidDatePreset, ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

interface DateRangeFilterProps {
  datePreset: string;
  onDateRangeChange: (range: any, preset: string) => void;
}

const DateRangeFilter = ({ datePreset, onDateRangeChange }: DateRangeFilterProps) => {
  // Strictly validate the preset with a guaranteed fallback
  const actualPreset = mapToValidDatePreset(datePreset) || 'last_30d';
  
  useEffect(() => {
    console.log(`[DATE FILTER] Initialized with validated preset: ${actualPreset}`);
    
    // Show a toast notification to indicate that date preset is being used
    toast({
      title: "Date preset active",
      description: `Using date preset: ${actualPreset}`,
      duration: 2000
    });
  }, [actualPreset]);

  // Handle date range changes with validation
  const handleDateRangeChange = (range: DateRange, preset: DatePresetOption) => {
    // For custom preset, we still need a valid Meta API preset for the actual API call
    // We'll use the date range to determine an appropriate preset or default to last_30d
    const validatedPreset = preset === 'custom' 
      ? 'last_30d' // Default for custom ranges to last_30d instead of maximum
      : preset;
      
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
    <>
      <div style={{ background: '#e6f7ff', padding: '5px', margin: '5px 0', borderRadius: '4px', fontSize: '14px' }}>
        💡 Date preset in use: {actualPreset}
      </div>
      <DateRangeSelector 
        onChange={handleDateRangeChange} 
        initialPreset={actualPreset as ValidMetaDatePreset}
      />
    </>
  );
};

export default DateRangeFilter;
