
import { useState } from 'react';
import { DateRange, DatePresetOption } from '../types';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export function useDateRangeSelection(
  onChange: (dateRange: DateRange, preset: DatePresetOption) => void,
  initialPreset: DatePresetOption = 'last_28d'
) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DatePresetOption>('last_28d');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(today.getDate() - 28);
    return { from: twentyEightDaysAgo, to: today };
  });

  const handlePresetChange = (preset: DatePresetOption) => {
    if (preset === 'custom') {
      setSelectedPreset('custom');
      setIsCalendarOpen(true);
      return;
    }
    
    const validatedPreset = mapToValidDatePreset(preset);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let newRange: DateRange = null;
    
    switch (validatedPreset) {
      case 'today':
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        newRange = { from: startOfToday, to: today };
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const startOfYesterday = new Date(yesterday);
        startOfYesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        newRange = { from: startOfYesterday, to: endOfYesterday };
        break;
      case 'last_7d':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        newRange = { from: sevenDaysAgo, to: today };
        break;
      case 'last_28d':
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(today.getDate() - 28);
        twentyEightDaysAgo.setHours(0, 0, 0, 0);
        newRange = { from: twentyEightDaysAgo, to: today };
        break;
      case 'this_month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        newRange = { from: startOfMonth, to: today };
        break;
      case 'last_month':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startOfLastMonth.setHours(0, 0, 0, 0);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        newRange = { from: startOfLastMonth, to: endOfLastMonth };
        break;
      default:
        console.warn(`[DATE SELECTOR] Unhandled preset: ${validatedPreset}, using last_28d`);
        const defaultDaysAgo = new Date();
        defaultDaysAgo.setDate(today.getDate() - 28);
        defaultDaysAgo.setHours(0, 0, 0, 0);
        newRange = { from: defaultDaysAgo, to: today };
        break;
    }

    setSelectedPreset(validatedPreset);
    setDateRange(newRange);
    onChange(newRange, validatedPreset);
    
    const isClosingCalendarNeeded = 
      (selectedPreset === 'custom') && (validatedPreset !== 'custom');
    
    if (isClosingCalendarNeeded) {
      setIsCalendarOpen(false);
    }
  };

  const handleCalendarSelect = (range: DateRange) => {
    if (range?.from && range?.to) {
      const endDate = new Date(range.to);
      endDate.setHours(23, 59, 59, 999);
      
      const updatedRange = { from: range.from, to: endDate };
      setDateRange(updatedRange);
      onChange(updatedRange, 'custom');
    } else {
      setDateRange(range);
    }
  };

  return {
    isCalendarOpen,
    setIsCalendarOpen,
    selectedPreset,
    dateRange,
    handlePresetChange,
    handleCalendarSelect
  };
}
