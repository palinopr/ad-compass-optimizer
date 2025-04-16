
export const buildInsightsUrl = (
  campaignId: string,
  token: string,
  datePreset: string = 'last_30d',
  fields: string = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend'
): string => {
  // Always log what we're trying to build
  console.log(`[INSIGHTS URL] Building URL for campaign ${campaignId} with date_preset=${datePreset}`);
  
  // Force date_preset to last_30d regardless of input
  const forcedDatePreset = 'last_30d';
  if (datePreset !== forcedDatePreset) {
    console.log(`[INSIGHTS URL] Overriding input date_preset '${datePreset}' with forced value '${forcedDatePreset}'`);
    datePreset = forcedDatePreset;
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
    
    // NEW: Checkmark log to confirm time_range parameter
    console.log(`✅ Final insights URL: ${debugUrl}`);
    
    return url;
  }
  
  // Standard case - use date_preset parameter
  const url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&time_increment=1&access_token=${token}`;
  
  // Log the URL with token redacted for debugging
  const debugUrl = url.replace(token, 'REDACTED_TOKEN');
  console.log(`[INSIGHTS URL] Built URL with date_preset=${datePreset}: ${debugUrl}`);
  
  // NEW: Checkmark log to confirm date_preset parameter
  console.log(`✅ Final insights URL: ${debugUrl}`);
  
  return url;
};
