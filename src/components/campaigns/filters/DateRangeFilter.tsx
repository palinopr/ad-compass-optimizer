
import React from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';

interface DateRangeFilterProps {
  datePreset: string;
  onDateRangeChange: (range: any, preset: string) => void;
}

const DateRangeFilter = ({ datePreset, onDateRangeChange }: DateRangeFilterProps) => {
  // If the outdated preset is passed, replace it with the correct one
  const actualPreset = datePreset === 'last30days' ? 'last_28d' : datePreset;
  
  return (
    <DateRangeSelector 
      onChange={onDateRangeChange} 
      initialPreset={actualPreset}
    />
  );
};

export default DateRangeFilter;
