
import { isValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export const validateDatePreset = (datePreset: string): string => {
  // Immediately log what we're validating for debugging
  console.log(`[INSIGHTS FETCH] Validating date_preset: "${datePreset}"`);
  
  // List of strictly valid Meta API date presets
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  // EXPANDED CHECK: Always block last_28d and any derivatives or misspellings
  if (datePreset === 'last_28d' || 
      datePreset === 'last28d' || 
      datePreset === 'last-28d' ||
      datePreset === '28d' ||
      datePreset === 'last28days' ||
      datePreset === 'last_28days') {
    console.warn(`[INSIGHTS FETCH] Blocking known problematic date_preset "${datePreset}", using "maximum" instead`);
    
    // Store info about this conversion for debugging
    try {
      const blockedRequests = JSON.parse(localStorage.getItem('blocked_last_28d_requests') || '[]');
      blockedRequests.push({
        timestamp: new Date().toISOString(),
        original: datePreset,
        replacedWith: 'maximum',
        location: 'datePresetValidator.ts'
      });
      localStorage.setItem('blocked_last_28d_requests', JSON.stringify(blockedRequests.slice(-20))); // Keep last 20
    } catch (e) {
      // Ignore storage errors
    }
    
    return 'maximum';
  }
  
  // Directly check if the preset is in the valid list
  if (!validPresets.includes(datePreset)) {
    console.error(`[INSIGHTS FETCH] Invalid date_preset "${datePreset}" detected, defaulting to maximum`);
    
    // Store info about invalid presets for debugging
    try {
      const invalidPresets = JSON.parse(localStorage.getItem('invalid_date_presets') || '[]');
      invalidPresets.push({
        timestamp: new Date().toISOString(),
        invalid: datePreset,
        replacedWith: 'maximum',
        location: 'datePresetValidator.ts'
      });
      localStorage.setItem('invalid_date_presets', JSON.stringify(invalidPresets.slice(-20))); // Keep last 20
    } catch (e) {
      // Ignore storage errors
    }
    
    return 'maximum';
  }
  
  // Store the validated date_preset for debugging
  try {
    localStorage.setItem('last_used_date_preset', datePreset);
    localStorage.setItem('date_preset_validator_timestamp', new Date().toISOString());
  } catch (e) {
    // Ignore storage errors
  }
  
  console.log(`[INSIGHTS FETCH] Using validated date_preset: "${datePreset}"`);
  return datePreset;
};
