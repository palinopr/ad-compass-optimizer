
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
