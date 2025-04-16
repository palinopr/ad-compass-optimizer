
export const buildInsightsUrl = (
  campaignId: string,
  token: string,
  datePreset: string,
  fields: string = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend'
): string => {
  // Always check that datePreset has a value and is valid
  if (!datePreset) {
    console.warn('[INSIGHTS URL] Missing date_preset, defaulting to last_28d');
    datePreset = 'last_28d';
  }
  
  // Sanitize and validate the date preset
  const validPresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_28d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year'
  ];
  
  // Reject obviously malformed values
  if (datePreset.includes(' ') || datePreset === 'date_pre' || 
      datePreset.length < 5 || datePreset.includes(',')) {
    console.error(`[INSIGHTS URL] Malformed date_preset detected: "${datePreset}", using last_28d instead`);
    datePreset = 'last_28d';
  } else if (!validPresets.includes(datePreset)) {
    // Map known values like last30days to valid ones
    if (datePreset === 'last30days' || datePreset === 'last_30days') {
      datePreset = 'last_28d';
      console.log(`[INSIGHTS URL] Mapped legacy preset '${datePreset}' to 'last_28d'`);
    } else if (datePreset === 'last7days') {
      datePreset = 'last_7d';
      console.log(`[INSIGHTS URL] Mapped legacy preset '${datePreset}' to 'last_7d'`);
    } else {
      console.warn(`[INSIGHTS URL] Potentially invalid date_preset: "${datePreset}", proceeding but may fail`);
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
