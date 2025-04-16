
import { isValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

export const validateDatePreset = (datePreset: string): string => {
  // List of strictly valid Meta API date presets
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  // Always block last_28d entirely - this has been consistently problematic
  if (datePreset === 'last_28d') {
    console.warn(`[INSIGHTS FETCH] Blocking known problematic date_preset "last_28d", using "maximum" instead`);
    
    // Store info about this conversion for debugging
    try {
      const blockedRequests = JSON.parse(localStorage.getItem('blocked_last_28d_requests') || '[]');
      blockedRequests.push({
        timestamp: new Date().toISOString(),
        original: 'last_28d',
        replacedWith: 'maximum'
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
