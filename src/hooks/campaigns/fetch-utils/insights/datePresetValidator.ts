
import { mapToValidDatePreset, isValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export const validateDatePreset = (datePreset: string): string => {
  // First ensure we have a valid preset format
  const validatedPreset = mapToValidDatePreset(datePreset);
  
  // Additional check for obviously malformed values
  if (!validatedPreset || 
      validatedPreset.includes(' ') || 
      validatedPreset === 'date_pre' || 
      validatedPreset.length < 5 || 
      validatedPreset.includes(',')) {
    console.error(`[INSIGHTS FETCH] Invalid date_preset "${datePreset}" detected, defaulting to last_28d`);
    return 'last_28d';
  }
  
  if (!isValidMetaDatePreset(validatedPreset)) {
    console.warn(`[INSIGHTS FETCH] Non-standard date_preset "${datePreset}" mapped to "${validatedPreset}"`);
  }
  
  // Store the last used date_preset for debugging
  try {
    localStorage.setItem('last_used_date_preset', validatedPreset);
  } catch (e) {
    // Ignore storage errors
  }
  
  return validatedPreset;
};
