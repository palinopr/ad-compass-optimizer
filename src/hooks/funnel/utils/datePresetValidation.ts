
// Define our own mapping function since we can't rely on the one from datePresetParser
const mapToValidDatePreset = (preset: string): string => {
  // List of valid Meta date presets
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  // If it's already a valid preset, use it
  if (validPresets.includes(preset)) {
    return preset;
  }
  
  // Map legacy presets to valid ones
  if (preset === 'last30days' || preset === 'last_30days' || preset === 'last_30d') {
    console.log(`[DATE PRESET MAPPING] Mapped legacy preset '${preset}' to 'maximum'`);
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

const safelyValidateDatePreset = (datePreset: string): string => {
  // Always log what we're validating
  console.log(`[INSIGHTS HOOK] Validating datePreset: "${datePreset}"`);
  
  // Block last_28d and similar patterns
  if (datePreset === 'last_28d' || 
      datePreset.includes('28d') || 
      datePreset.includes('28day')) {
    console.warn(`[INSIGHTS HOOK] Blocking problematic date preset "${datePreset}", using maximum instead`);
    
    // Track this replacement for debugging
    try {
      const blockedHookRequests = JSON.parse(localStorage.getItem('hook_blocked_28d_requests') || '[]');
      blockedHookRequests.push({
        timestamp: new Date().toISOString(),
        original: datePreset,
        replacedWith: 'maximum',
        location: 'useItemInsights.safelyValidateDatePreset'
      });
      localStorage.setItem('hook_blocked_28d_requests', JSON.stringify(blockedHookRequests.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
    
    return 'maximum';
  }
  
  // Use the existing mapper, but override any "last_28d" it might return
  const mappedPreset = mapToValidDatePreset(datePreset);
  
  // Double-check that the mapping didn't give us a problematic preset
  if (mappedPreset === 'last_28d') {
    console.warn(`[INSIGHTS HOOK] Mapping returned problematic preset "last_28d", overriding to maximum`);
    return 'maximum';
  }
  
  return mappedPreset;
};

export { safelyValidateDatePreset };
