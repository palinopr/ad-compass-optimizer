
import { ValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

const validPresets = [
  'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
  'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
  'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
  'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
  'maximum'
] as const;

const mapToValidDatePreset = (preset: string): ValidMetaDatePreset => {
  // If it's already a valid preset, use it
  if (validPresets.includes(preset as ValidMetaDatePreset)) {
    return preset as ValidMetaDatePreset;
  }
  
  // Map legacy and problematic presets to valid ones
  if (preset === 'last_28d' || 
      preset === 'last28days' || 
      preset === 'last30days' || 
      preset === 'last_30days' || 
      preset === 'last_30d') {
    console.log(`[DATE PRESET MAPPING] Mapped problematic preset '${preset}' to 'maximum'`);
    return 'maximum';
  }
  
  if (preset === 'last7days') {
    console.log(`[DATE PRESET MAPPING] Mapped legacy preset '${preset}' to 'last_7d'`);
    return 'last_7d';
  }
  
  // Default fallback
  console.warn(`[DATE PRESET MAPPING] Unrecognized preset '${preset}', using default 'maximum'`);
  return 'maximum';
};

const safelyValidateDatePreset = (datePreset: string): ValidMetaDatePreset => {
  // Always log what we're validating
  console.log(`[INSIGHTS HOOK] Validating datePreset: "${datePreset}"`);
  
  // Block all variations of 28-day presets
  if (datePreset === 'last_28d' || 
      datePreset.includes('28d') || 
      datePreset.includes('28day')) {
    console.warn(`[INSIGHTS HOOK] Blocking problematic date preset "${datePreset}", using maximum instead`);
    return 'maximum';
  }
  
  // Use the mapping function to validate and potentially transform the preset
  const mappedPreset = mapToValidDatePreset(datePreset);
  
  // Double-check that the mapping didn't give us a problematic preset
  if (mappedPreset === 'last_28d') {
    console.warn(`[INSIGHTS HOOK] Mapping returned problematic preset "last_28d", overriding to maximum`);
    return 'maximum';
  }
  
  return mappedPreset;
};

export { safelyValidateDatePreset, mapToValidDatePreset, validPresets };

