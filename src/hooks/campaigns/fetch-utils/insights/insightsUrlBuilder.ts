
export const buildInsightsUrl = (
  campaignId: string,
  token: string,
  datePreset: string,
  fields: string = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend'
): string => {
  // Always check that datePreset has a value
  if (!datePreset) {
    console.warn('[INSIGHTS URL] Missing date_preset, defaulting to last_28d');
    datePreset = 'last_28d';
  }
  
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
