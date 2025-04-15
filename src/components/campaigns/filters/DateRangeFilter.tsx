
import React from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';

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
  
  return (
    <DateRangeSelector 
      onChange={onDateRangeChange} 
      initialPreset={actualPreset}
    />
  );
};

export default DateRangeFilter;
