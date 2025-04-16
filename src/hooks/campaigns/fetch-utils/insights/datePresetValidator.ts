
import { isValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export const validateDatePreset = (datePreset: string): string => {
  // List of strictly valid Meta API date presets
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_28d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  // Skip problematic presets that have been causing 400 errors
  if (datePreset === 'last_28d') {
    console.warn(`[INSIGHTS FETCH] Avoiding problematic date_preset "last_28d", using "maximum" instead`);
    return 'maximum';
  }
  
  // Directly check if the preset is in the valid list
  if (!validPresets.includes(datePreset)) {
    console.error(`[INSIGHTS FETCH] Invalid date_preset "${datePreset}" detected, defaulting to maximum`);
    return 'maximum';
  }
  
  // Store the validated date_preset for debugging
  try {
    localStorage.setItem('last_used_date_preset', datePreset);
  } catch (e) {
    // Ignore storage errors
  }
  
  console.log(`[INSIGHTS FETCH] Using validated date_preset: "${datePreset}"`);
  return datePreset;
};
