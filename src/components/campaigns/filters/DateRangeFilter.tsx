
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
    switch (preset) {
      case 'last30days': 
        return 'last_28d';
      case 'last_30d': 
        return 'last_28d';
      case 'last7days': 
        return 'last_7d';
      default: 
        return preset;
    }
  };
  
  // Apply preset mapping
  const actualPreset = mapLegacyPreset(datePreset);
  
  useEffect(() => {
    console.log(`[DATE FILTER] Initialized with preset: ${actualPreset}`);
  }, []);

  // Handle date range changes
  const handleDateRangeChange = (range: any, preset: string) => {
    const mappedPreset = mapLegacyPreset(preset);
    console.log(`[DATE FILTER] Changing date to: ${mappedPreset}`);
    
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
