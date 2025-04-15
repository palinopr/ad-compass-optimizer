
import React, { useEffect } from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';
import { toast } from '@/hooks/use-toast';

interface DateRangeFilterProps {
  datePreset: string;
  onDateRangeChange: (range: any, preset: string) => void;
}

const DateRangeFilter = ({ datePreset, onDateRangeChange }: DateRangeFilterProps) => {
  // Map legacy presets to compatible Meta API presets
  const mapLegacyPreset = (preset: string): string => {
    const presetMapping: Record<string, string> = {
      'last30days': 'last_28d',
      'last_30d': 'last_28d', 
      'last7days': 'last_7d',
      // No mapping needed for valid presets
      'today': 'today',
      'yesterday': 'yesterday',
      'this_month': 'this_month',
      'last_month': 'last_month'
    };
    
    return presetMapping[preset] || preset;
  };
  
  // Apply preset mapping
  const actualPreset = mapLegacyPreset(datePreset);
  
  useEffect(() => {
    console.log(`[DATE FILTER] Initialized with preset: ${actualPreset}`);
  }, [actualPreset]);

  // Handle date range changes
  const handleDateRangeChange = (range: any, preset: string) => {
    const mappedPreset = mapLegacyPreset(preset);
    console.log(`[DATE FILTER] Changing date to: ${mappedPreset} (original: ${preset})`);
    
    // Show a toast notification
    if (preset !== datePreset) {
      toast({
        title: "Updating campaigns",
        description: `Fetching campaigns for ${preset === 'custom' ? 'custom date range' : preset}`,
        duration: 2000
      });
    }
    
    // Call the parent handler
    onDateRangeChange(range, preset);
  };
  
  return (
    <DateRangeSelector 
      onChange={handleDateRangeChange} 
      initialPreset={actualPreset}
    />
  );
};

export default DateRangeFilter;
