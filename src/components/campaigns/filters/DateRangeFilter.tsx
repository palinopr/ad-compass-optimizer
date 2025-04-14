
import React from 'react';
import DateRangeSelector from '@/components/meta/filters/DateRangeSelector';

interface DateRangeFilterProps {
  datePreset: string;
  onDateRangeChange: (range: any, preset: string) => void;
}

const DateRangeFilter = ({ datePreset, onDateRangeChange }: DateRangeFilterProps) => {
  return (
    <DateRangeSelector 
      onChange={onDateRangeChange} 
      initialPreset={datePreset}
    />
  );
};

export default DateRangeFilter;
