
import { format } from 'date-fns';
import { DateRange } from '../types';

export const formatDateRange = (dateRange: DateRange): string => {
  if (!dateRange?.from) return 'Select date range';
  
  const fromDate = format(dateRange.from, 'MMM d, yyyy');
  
  if (!dateRange.to || dateRange.from.toDateString() === dateRange.to.toDateString()) {
    return fromDate;
  }
  
  return `${fromDate} - ${format(dateRange.to, 'MMM d, yyyy')}`;
};
