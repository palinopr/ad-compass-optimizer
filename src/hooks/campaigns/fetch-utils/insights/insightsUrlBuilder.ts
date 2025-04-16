
export const buildInsightsUrl = (
  campaignId: string,
  token: string,
  datePreset: string = 'maximum', // Changed default from 'maximum' to ensure consistency
  fields: string = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend'
): string => {
  // Always log what we're trying to build
  console.log(`[INSIGHTS URL] Building URL for campaign ${campaignId} with date_preset=${datePreset}`);
  
  // Always check that datePreset has a value and is valid
  if (!datePreset) {
    console.warn('[INSIGHTS URL] Missing date_preset, defaulting to maximum');
    datePreset = 'maximum';
  }
  
  // IMPROVED: More aggressive blocks for last_28d with pattern matching
  if (datePreset === 'last_28d' || 
      datePreset.includes('28d') || 
      datePreset.includes('28day') ||
      datePreset === 'last28d') {
    console.warn(`[INSIGHTS URL] Blocking problematic date_preset "${datePreset}", replacing with "maximum"`);
    
    // Log this blocking for debugging
    try {
      const blockedRequests = JSON.parse(localStorage.getItem('url_blocked_last_28d') || '[]');
      blockedRequests.push({
        timestamp: new Date().toISOString(),
        campaignId,
        original: datePreset,
        replacedWith: 'maximum',
        location: 'insightsUrlBuilder'
      });
      localStorage.setItem('url_blocked_last_28d', JSON.stringify(blockedRequests.slice(-20))); // Keep last 20
    } catch (e) {
      // Ignore storage errors
    }
    
    datePreset = 'maximum';
  }
  
  // Strict list of Meta-accepted date presets (official API values only)
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  // Strict validation - only accept exact matches from the validPresets array
  if (!validPresets.includes(datePreset)) {
    console.error(`[INSIGHTS URL] Invalid date_preset detected: "${datePreset}", using maximum instead`);
    datePreset = 'maximum';
    
    // Track invalid date preset attempts
    try {
      const invalidAttempts = JSON.parse(localStorage.getItem('invalid_date_preset_attempts') || '[]');
      invalidAttempts.push({
        timestamp: new Date().toISOString(),
        campaignId,
        invalid: datePreset,
        location: 'insightsUrlBuilder'
      });
      localStorage.setItem('invalid_date_preset_attempts', JSON.stringify(invalidAttempts.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  console.log(`[INSIGHTS URL] Using validated date_preset: "${datePreset}" for campaign ${campaignId}`);
  
  // Special handling for today/yesterday - use time_range instead of date_preset for more reliability
  if (['today', 'yesterday'].includes(datePreset)) {
    const date = datePreset === 'today' 
      ? new Date() 
      : new Date(Date.now() - 86400000);
    
    const formattedDate = date.toISOString().split('T')[0];
    
    // Build URL with time_range instead of date_preset
    const url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&time_range={"since":"${formattedDate}","until":"${formattedDate}"}&time_increment=1&access_token=${token}`;
    
    // Log the URL with token redacted for debugging
    const debugUrl = url.replace(token, 'REDACTED_TOKEN');
    console.log(`[INSIGHTS URL] Built URL with time_range for ${datePreset}: ${debugUrl}`);
    
    return url;
  }
  
  // Standard case - use date_preset parameter
  const url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&time_increment=1&access_token=${token}`;
  
  // Log the URL with token redacted for debugging
  const debugUrl = url.replace(token, 'REDACTED_TOKEN');
  console.log(`[INSIGHTS URL] Built URL with date_preset=${datePreset}: ${debugUrl}`);
  
  return url;
};
